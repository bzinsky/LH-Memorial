"use client";
import { useIsLoggedIn } from "@/app/loginService";
import { useRef, useState } from "react";
import { SubmitButton, TextInput } from "@/components/textInput";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useIsLoggedIn();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormData) => {
    if (e.get("name")?.toString().toLowerCase() === "hunter") {
      setIsLoggedIn(true);
    } else {
      setError("Incorrect");
    }
  };
  return (
    <main>
      {!isLoggedIn && (
        <div className="flex w-full min-h-screen place-items-center place-content-center">
          <form action={onSubmit} className="grid space-y-4 place-items-center">
            <p>To enter, what is Louie&apos;s full first name?</p>
            <div>
              <span>
                Louis-
                <TextInput label="" name="name" ref={inputRef} />
              </span>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <SubmitButton onClick={() => {}} />
          </form>
        </div>
      )}
      {isLoggedIn && (
        <div className="grid space-y-5 px-20 font-serif">
          <div>In Memoriam: Louis-Hunter Kean</div>
          <div>
            It is with heavy hearts and profound sorrow that we announce the
            untimely passing of Louis-Hunter Kean, a beloved son, brother,
            uncle, friend, and fiancé. Louis-Hunter departed this world at the
            age of 34, leaving behind a legacy of love, laughter, and cherished
            memories. He succumbed to a rare and unexpected parasitic illness, a
            tragedy that has left all who knew him in shock and disbelief.
          </div>
          <div>
            Born on March 22, 1989, Louis-Hunter was a beacon of joy and
            vitality. His radiant spirit touched the lives of everyone around
            him. Known for his infectious laughter and warm personality,
            Louis-Hunter effortlessly cultivated meaningful connections with a
            wide circle of friends, earning the admiration and affection of all
            who had the privilege of knowing him.
          </div>
          <div>
            Louis-Hunter&apos;s family was the center of his universe, and he
            was a devoted son to Lois and Ted. He shared an unbreakable bond
            with his siblings, Ted III, Jessica, and Priscilla, creating a
            foundation of love and support that defined their close-knit family.
            His passing leaves a void that can never be filled, and his memory
            will forever be etched in the hearts of those who held him dear.
          </div>
          <div>
            In addition to his family, Louis-Hunter leaves behind his fiancée,
            Zara Gaudioso, with whom he had planned to build a life filled with
            love and dreams. Their connection was a source of strength and joy,
            a testament to the profound love they shared. Zara will undoubtedly
            cherish the memories of their time together, holding onto the love
            that will forever endure in her heart.
          </div>
          <div>
            Louis-Hunter was not only a caring brother but also a cherished
            uncle to Blake, Charlie, Bear, Walker, and Teddy IV. He embraced his
            role as an uncle with boundless enthusiasm, always ready to share a
            joke, offer guidance, or simply spend quality time with his nieces
            and nephews. His positive influence will undoubtedly live on in the
            lives of the young ones who looked up to him.
          </div>
          <div>
            Louis-Hunter was a man of many passions and talents. An avid
            adventurer, he sought joy in the simple pleasures of life, whether
            it be exploring new landscapes, enjoying music, or sharing a meal
            with friends. His zest for life was contagious, and he encouraged
            those around him to embrace every moment.
          </div>
          <div>
            In the wake of this devastating loss, we remember Louis-Hunter Kean
            as a shining light extinguished far too soon. The void left by his
            absence is immeasurable, but the memories of his laughter, kindness,
            and love will endure as a testament to the beautiful soul he was.
            May his soul rest in eternal peace, and may his loved ones find
            solace in the cherished memories they shared with him.
          </div>
        </div>
      )}
    </main>
  );
}
