import React from "react";
import AboutInfo from "./AboutInfo"
import OfficerSection from "./OfficerSection"
import SponsorsWidget from "../SponsorWidget";

const About = () => {
  return (
    <div style={{ backgroundColor: '#BF5700' }}>
      <AboutInfo />
      <OfficerSection />  
      <SponsorsWidget />
    </div>
  );
};

export default About;
