import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import labImage from "/assets/lab.jpg";
import CarouselComponent from "./Carousel.jsx";
import SponsorsWidget from "./SponsorWidget";

const Home = () => {
   const { ref, inView } = useInView({
      triggerOnce: true,
      threshold: 0.2,
   });

   return (
      <main className="w-full overflow-x-hidden">
         {/* Who We Are Section - Full Width */}
         <div className="py-20 px-4 md:px-8 w-full">
            <h2 className="text-5xl font-['Antonio'] text-[#213C58] mb-12 text-center">
               Who We Are
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8 w-full">
               {/* Text Content */}
               <div className="w-full md:w-1/2">
                  <p className="text-lg font-[Anton]">
                     Welcome to Longhorn Neurotech, a student organization with
                     a singular focus: facilitating your entry into the world of
                     neural engineering. Our purpose is to provide you with the
                     knowledge, experiences, and connections necessary for a
                     successful career in academia or industry. Through active
                     participation in the NeuroTechX (NTX) international
                     undergraduate student competition, we offer a platform for
                     you to sharpen your skills and collaborate with like-minded
                     peers.
                  </p>
               </div>

               {/* Image */}
               <div className="w-full md:w-1/2">
                  <img
                     src={labImage}
                     alt="Neurotech Lab"
                     className="rounded-lg shadow-xl w-full h-[400px] object-cover"
                  />
               </div>
            </div>
         </div>

         {/* Our Mission Section - Full Width */}
         <div className="bg-[#598BBC] py-20 px-4 md:px-8 w-full">
            <h2 className="text-5xl font-['Antonio'] text-[#BF5801] mb-12 text-center">
               Our Mission
            </h2>
            <p className="text-lg bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
               In addition to competition, we take education seriously. Our club
               is dedicated to creating and curating educational content that
               ensures a deep understanding of neural engineering concepts. We
               believe that a strong foundation is crucial for your growth in
               this complex field. Furthermore, we understand the significance
               of networking. Longhorn Neurotech provides opportunities to
               connect with guest speakers who are established professionals in
               neural engineering.
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
