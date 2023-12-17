// Shamelessly ripped from GitHub. :)
// https://github.com/image-size/image-size/tree/main
export type ISize = {
  width: number | undefined;
  height: number | undefined;
  orientation?: number;
  type?: string;
};

export type ISizeCalculationResult = {
  images?: ISize[];
} & ISize;

type IImage = {
  validate: (input: Uint8Array) => boolean;
  calculate: (input: Uint8Array, filepath?: string) => ISizeCalculationResult;
};

const decoder = new TextDecoder();
const toUTF8String = (input: Uint8Array, start = 0, end = input.length) =>
  decoder.decode(input.slice(start, end));

const toHexString = (input: Uint8Array, start = 0, end = input.length) =>
  input
    .slice(start, end)
    .reduce((memo, i) => memo + ("0" + i.toString(16)).slice(-2), "");

const readInt16LE = (input: Uint8Array, offset = 0) => {
  const val = input[offset] + input[offset + 1] * 2 ** 8;
  return val | ((val & (2 ** 15)) * 0x1fffe);
};

const readUInt16BE = (input: Uint8Array, offset = 0) =>
  input[offset] * 2 ** 8 + input[offset + 1];

const readUInt16LE = (input: Uint8Array, offset = 0) =>
  input[offset] + input[offset + 1] * 2 ** 8;

const readUInt24LE = (input: Uint8Array, offset = 0) =>
  input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16;

const readInt32LE = (input: Uint8Array, offset = 0) =>
  input[offset] +
  input[offset + 1] * 2 ** 8 +
  input[offset + 2] * 2 ** 16 +
  (input[offset + 3] << 24);

const readUInt32BE = (input: Uint8Array, offset = 0) =>
  input[offset] * 2 ** 24 +
  input[offset + 1] * 2 ** 16 +
  input[offset + 2] * 2 ** 8 +
  input[offset + 3];

const readUInt32LE = (input: Uint8Array, offset = 0) =>
  input[offset] +
  input[offset + 1] * 2 ** 8 +
  input[offset + 2] * 2 ** 16 +
  input[offset + 3] * 2 ** 24;

// Abstract reading multi-byte unsigned integers
const methods = {
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE,
} as const;

type MethodName = keyof typeof methods;

function readUInt(
  input: Uint8Array,
  bits: 16 | 32,
  offset: number,
  isBigEndian: boolean,
): number {
  offset = offset || 0;
  const endian = isBigEndian ? "BE" : "LE";
  const methodName: MethodName = ("readUInt" + bits + endian) as MethodName;
  return methods[methodName](input, offset);
}

const BMP: IImage = {
  validate: (input) => toUTF8String(input, 0, 2) === "BM",

  calculate: (input) => ({
    height: Math.abs(readInt32LE(input, 22)),
    width: readUInt32LE(input, 18),
  }),
};
const gifRegexp = /^GIF8[79]a/;
const GIF: IImage = {
  validate: (input) => gifRegexp.test(toUTF8String(input, 0, 6)),

  calculate: (input) => ({
    height: readUInt16LE(input, 8),
    width: readUInt16LE(input, 6),
  }),
};

const EXIF_MARKER = "45786966";
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = "4d4d";
const LITTLE_ENDIAN_BYTE_ALIGN = "4949";

// Each entry is exactly 12 bytes
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;

function isEXIF(input: Uint8Array): boolean {
  return toHexString(input, 2, 6) === EXIF_MARKER;
}

function extractSize(input: Uint8Array, index: number): ISize {
  return {
    height: readUInt16BE(input, index),
    width: readUInt16BE(input, index + 2),
  };
}

function extractOrientation(exifBlock: Uint8Array, isBigEndian: boolean) {
  // TODO: assert that this contains 0x002A
  // let STATIC_MOTOROLA_TIFF_HEADER_BYTES = 2
  // let TIFF_IMAGE_FILE_DIRECTORY_BYTES = 4

  // TODO: derive from TIFF_IMAGE_FILE_DIRECTORY_BYTES
  const idfOffset = 8;

  // IDF osset works from right after the header bytes
  // (so the offset includes the tiff byte align)
  const offset = EXIF_HEADER_BYTES + idfOffset;

  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian);

  for (
    let directoryEntryNumber = 0;
    directoryEntryNumber < idfDirectoryEntries;
    directoryEntryNumber++
  ) {
    const start =
      offset +
      NUM_DIRECTORY_ENTRIES_BYTES +
      directoryEntryNumber * IDF_ENTRY_BYTES;
    const end = start + IDF_ENTRY_BYTES;

    // Skip on corrupt EXIF blocks
    if (start > exifBlock.length) {
      return;
    }

    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, isBigEndian);

    // 0x0112 (decimal: 274) is the `orientation` tag ID
    if (tagNumber === 274) {
      const dataFormat = readUInt(block, 16, 2, isBigEndian);
      if (dataFormat !== 3) {
        return;
      }

      // unsinged int has 2 bytes per component
      // if there would more than 4 bytes in total it's a pointer
      const numberOfComponents = readUInt(block, 32, 4, isBigEndian);
      if (numberOfComponents !== 1) {
        return;
      }

      return readUInt(block, 16, 8, isBigEndian);
    }
  }
}

function validateExifBlock(input: Uint8Array, index: number) {
  // Skip APP1 Data Size
  const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);

  // Consider byte alignment
  const byteAlign = toHexString(
    exifBlock,
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES,
  );

  // Ignore Empty EXIF. Validate byte alignment
  const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;

  if (isBigEndian || isLittleEndian) {
    return extractOrientation(exifBlock, isBigEndian);
  }
}

function validateInput(input: Uint8Array, index: number): void {
  // index should be within buffer limits
  if (index > input.length) {
    throw new TypeError("Corrupt JPG, exceeded buffer limits");
  }
  // Every JPEG block must begin with a 0xFF
  if (input[index] !== 0xff) {
    throw new TypeError("Invalid JPG, marker table corrupted");
  }
}

const JPG: IImage = {
  validate: (input) => toHexString(input, 0, 2) === "ffd8",

  calculate(input) {
    // Skip 4 chars, they are for signature
    input = input.slice(4);

    let orientation: number | undefined;
    let next: number;
    while (input.length) {
      // read length of the next block
      const i = readUInt16BE(input, 0);

      if (isEXIF(input)) {
        orientation = validateExifBlock(input, i);
      }

      // ensure correct format
      validateInput(input, i);

      // 0xFFC0 is baseline standard(SOF)
      // 0xFFC1 is baseline optimized(SOF)
      // 0xFFC2 is progressive(SOF2)
      next = input[i + 1];
      if (next === 0xc0 || next === 0xc1 || next === 0xc2) {
        const size = extractSize(input, i + 5);

        // TODO: is orientation=0 a valid answer here?
        if (!orientation) {
          return size;
        }

        return {
          height: size.height,
          orientation,
          width: size.width,
        };
      }

      // move to the next block
      input = input.slice(i + 2);
    }

    throw new TypeError("Invalid JPG, no size found");
  },
};

const pngSignature = "PNG\r\n\x1a\n";
const pngImageHeaderChunkName = "IHDR";

// Used to detect "fried" png's: http://www.jongware.com/pngdefry.html
const pngFriedChunkName = "CgBI";

const PNG: IImage = {
  validate(input) {
    if (pngSignature === toUTF8String(input, 1, 8)) {
      let chunkName = toUTF8String(input, 12, 16);
      if (chunkName === pngFriedChunkName) {
        chunkName = toUTF8String(input, 28, 32);
      }
      if (chunkName !== pngImageHeaderChunkName) {
        throw new TypeError("Invalid PNG");
      }
      return true;
    }
    return false;
  },

  calculate(input) {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32),
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16),
    };
  },
};

type IAttributes = {
  width: number | null;
  height: number | null;
  viewbox?: IAttributes | null;
};

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/;

const extractorRegExps = {
  height: /\sheight=(['"])([^%]+?)\1/,
  root: svgReg,
  viewbox: /\sviewBox=(['"])(.+?)\1/i,
  width: /\swidth=(['"])([^%]+?)\1/,
};

const INCH_CM = 2.54;
const units: { [unit: string]: number } = {
  in: 96,
  cm: 96 / INCH_CM,
  em: 16,
  ex: 8,
  m: (96 / INCH_CM) * 100,
  mm: 96 / INCH_CM / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1,
};

const unitsReg = new RegExp(
  `^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join("|")})?$`,
);

function parseLength(len: string) {
  const m = unitsReg.exec(len);
  if (!m) {
    return undefined;
  }
  return Math.round(Number(m[1]) * (units[m[2]] || 1));
}

function parseViewbox(viewbox: string): IAttributes {
  const bounds = viewbox.split(" ");
  return {
    height: parseLength(bounds[3]) as number,
    width: parseLength(bounds[2]) as number,
  };
}

function parseAttributes(root: string): IAttributes {
  const width = root.match(extractorRegExps.width);
  const height = root.match(extractorRegExps.height);
  const viewbox = root.match(extractorRegExps.viewbox);
  return {
    height: height && (parseLength(height[2]) as number),
    viewbox: viewbox && (parseViewbox(viewbox[2]) as IAttributes),
    width: width && (parseLength(width[2]) as number),
  };
}

function calculateByDimensions(attrs: IAttributes): ISize {
  return {
    height: attrs.height as number,
    width: attrs.width as number,
  };
}

function calculateByViewbox(attrs: IAttributes, viewbox: IAttributes): ISize {
  const ratio = (viewbox.width as number) / (viewbox.height as number);
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width,
    };
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio),
    };
  }
  return {
    height: viewbox.height as number,
    width: viewbox.width as number,
  };
}

const SVG: IImage = {
  // Scan only the first kilo-byte to speed up the check on larger files
  validate: (input) => svgReg.test(toUTF8String(input, 0, 1000)),

  calculate(input) {
    const root = toUTF8String(input).match(extractorRegExps.root);
    if (root) {
      const attrs = parseAttributes(root[0]);
      if (attrs.width && attrs.height) {
        return calculateByDimensions(attrs);
      }
      if (attrs.viewbox) {
        return calculateByViewbox(attrs, attrs.viewbox);
      }
    }
    throw new TypeError("Invalid SVG");
  },
};

function calculateExtended(input: Uint8Array): ISize {
  return {
    height: 1 + readUInt24LE(input, 7),
    width: 1 + readUInt24LE(input, 4),
  };
}

function calculateLossless(input: Uint8Array): ISize {
  return {
    height:
      1 +
      (((input[4] & 0xf) << 10) | (input[3] << 2) | ((input[2] & 0xc0) >> 6)),
    width: 1 + (((input[2] & 0x3f) << 8) | input[1]),
  };
}

function calculateLossy(input: Uint8Array): ISize {
  // `& 0x3fff` returns the last 14 bits
  // TO-DO: include webp scaling in the calculations
  return {
    height: readInt16LE(input, 8) & 0x3fff,
    width: readInt16LE(input, 6) & 0x3fff,
  };
}

const WEBP: IImage = {
  validate(input) {
    const riffHeader = "RIFF" === toUTF8String(input, 0, 4);
    const webpHeader = "WEBP" === toUTF8String(input, 8, 12);
    const vp8Header = "VP8" === toUTF8String(input, 12, 15);
    return riffHeader && webpHeader && vp8Header;
  },

  calculate(input) {
    const chunkHeader = toUTF8String(input, 12, 16);
    input = input.slice(20, 30);

    // Extended webp stream signature
    if (chunkHeader === "VP8X") {
      const extendedHeader = input[0];
      const validStart = (extendedHeader & 0xc0) === 0;
      const validEnd = (extendedHeader & 0x01) === 0;
      if (validStart && validEnd) {
        return calculateExtended(input);
      } else {
        // TODO: breaking change
        throw new TypeError("Invalid WebP");
      }
    }

    // Lossless webp stream signature
    if (chunkHeader === "VP8 " && input[0] !== 0x2f) {
      return calculateLossy(input);
    }

    // Lossy webp stream signature
    const signature = toHexString(input, 3, 6);
    if (chunkHeader === "VP8L" && signature !== "9d012a") {
      return calculateLossless(input);
    }

    throw new TypeError("Invalid WebP");
  },
};
const typeHandlers = {
  bmp: BMP,
  gif: GIF,
  jpg: JPG,
  png: PNG,
  svg: SVG,
  webp: WEBP,
};
type imageType = keyof typeof typeHandlers;
const keys = Object.keys(typeHandlers) as imageType[];

// This map helps avoid validating for every single image type
const firstBytes: { [byte: number]: imageType } = {
  0x42: "bmp",
  0x47: "gif",
  0x52: "webp",
  0x89: "png",
  0xff: "jpg",
};

function detector(input: Uint8Array): imageType | undefined {
  const byte = input[0];
  if (byte in firstBytes) {
    const type = firstBytes[byte];
    if (type && typeHandlers[type].validate(input)) {
      return type;
    }
  }

  const finder = (key: imageType) => typeHandlers[key].validate(input);
  return keys.find(finder);
}

type Options = {
  disabledFS: boolean;
  disabledTypes: imageType[];
};

const globalOptions: Options = {
  disabledFS: false,
  disabledTypes: [],
};

/**
 * Return size information based on an Uint8Array
 *
 * @param {Uint8Array} input
 * @param {String} filepath
 * @returns {Object}
 */
function lookup(input: Uint8Array, filepath?: string): ISizeCalculationResult {
  // detect the file type.. don't rely on the extension
  const type = detector(input);

  if (typeof type !== "undefined") {
    if (globalOptions.disabledTypes.indexOf(type) > -1) {
      throw new TypeError("disabled file type: " + type);
    }

    // find an appropriate handler for this file type
    if (type in typeHandlers) {
      const size = typeHandlers[type].calculate(input, filepath);
      if (size !== undefined) {
        size.type = type;
        return size;
      }
    }
  }

  // throw up, if we don't understand the file
  throw new TypeError(
    "unsupported file type: " + type + " (file: " + filepath + ")",
  );
}

/**
 * @param {Uint8Array|string} input - Uint8Array or relative/absolute path of the image file
 */
export function imageSize(input: Uint8Array): ISizeCalculationResult {
  return lookup(input);
}
