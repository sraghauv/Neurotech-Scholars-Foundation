import React from "react";
import AboutInfo from "./AboutInfo";
import OfficerSection from "./OfficerSection";
import SponsorsWidget from "../SponsorWidget";

const About = () => {
   return (
      <div style={{ backgroundColor: "#598392" }}>
         <AboutInfo />
         <OfficerSection />
         <SponsorsWidget />
      </div>
   );
};

export default About;
