import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CarouselComponent from "./Carousel.jsx";
import SponsorsWidget from "./SponsorWidget";
import Tnt from "/assets/TNT-Comp2.png";
import { Link } from "react-router-dom";

const Home = () => {
   const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.2,
   });

   return (
      <main className="w-full overflow-x-hidden overflow-y-hidden">
         <div className="relative flex items-center justify-center h-96 bg-[url('/assets/homepagebg.png')] bg-cover bg-center">
            <div className="text-center">
               <h1 className="text-white font-light text-[60px]">
                  Neurotech Scholars
               </h1>
               <h1 className="text-white text-[100px] font-bold underline decoration-[#F4f1de] underline-offset-[20px]">
                  Foundation
               </h1>
            </div>
         </div>

         {/* Who We Are Section - Full Width */}
         <div className="bg-white px-10 py-5">
            <div className="bg-gradient-to-r from-[#f291bc] to-[#0047a7] p-20 md:px-8 rounded-2xl">
               <div className="flex flex-row items-center gap-8">
                  {/* Left: Tnt Logo (50%) */}
                  <div className="flex-1 flex justify-center">
                     <img
                        src={Tnt}
                        alt="TNT Logo"
                        className="h-[500px] w-auto object-contain"
                     />
                  </div>

                  {/* Right: Text Content (50%) */}
                  <div className="flex-1">
                     <h1 className="text-5xl font-['Antonio'] text-white mb-6">
                        Join the Texas Neurotech BCI Competition!
                     </h1>
                     <p className="text-lg text-white">
                        Ready to push the boundaries of brain-computer interface
                        technology? Whether you're a seasoned developer, a
                        neuroscience enthusiast, or a curious student looking to
                        explore the cutting edge of human-machine interaction,
                        this competition offers the perfect platform to
                        demonstrate your skills. For details on registration,
                        competition guidelines, prizes, and more.
                     </p>
                     <Link to="/txnt">
                        <button className="bg-[#e2997c] text-white px-4 py-2 rounded-3xl mt-8 ml-[220px]">
                           Click Here
                        </button>
                     </Link>
                  </div>
               </div>
            </div>
         </div>

         {/* Our Mission Section - Full Width */}
         <div className="bg-[#F4f1de] py-20 px-4 md:px-8 w-full">
            <h2 className="text-5xl font-['Antonio'] text-[#598392] mb-12 text-center">
               Mission & Purpose
            </h2>
            <p className="text-lg bg-[#598392] text-white p-6 rounded-full p-16 shadow-lg  mx-auto">
               Neurotechnology Scholars Foundation’s purpose is to advance
               education and technology in the field of neuroscience by
               empowering the next generation of researchers and innovators. By
               fundraising on their behalf, we hope to provide monetary support
               to undergraduate projects and research. We aim to bridge the gap
               between cutting-edge neuroscience research and hands-on
               educational experiences. One hundred percent of our fundraising
               will go towards providing vital resources, mentorship, and
               funding for promising young minds to explore groundbreaking ideas
               and technologies that can revolutionize our understanding of the
               brain. Our mission includes a strong commitment to public
               education, ensuring that the latest findings in neuroscience
               technology are accessible to our community. The public benefit of
               advancing education and technology in neuroscience is profound,
               as it directly contributes to a deeper understanding of brain
               health and mental wellness for all. This initiative is to not
               only equip future leaders in the field but to also cultivate a
               more informed society, ultimately leading to better health
               outcomes and a stronger community.
            </p>
         </div>

         {/* Our Projects Section - Full Width */}
         <div ref={ref} className="bg-gray-50 py-20 px-4 md:px-8 w-full">
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={inView ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.8 }}
               className="w-full"
            >
               <h2 className="text-5xl font-['Antonio'] text-[#213C58] mb-12 text-center">
                  Our Projects
               </h2>
               <div className="mb-20">
                  <CarouselComponent />
               </div>
            </motion.div>
         </div>

         {/* Sponsors Section */}
         <SponsorsWidget />
      </main>
   );
};

export default Home;
