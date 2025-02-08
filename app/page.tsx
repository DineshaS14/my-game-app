// pages/index.tsx
import React from "react";
import GameBoard from '@/app/components/GameBoard';
import SpeechToText from "./components/SpeechToText";

const Home: React.FC = () => {
  return <>
   <div>
      <SpeechToText />
    </div>
    <GameBoard />
  </> ;
};

export default Home;
