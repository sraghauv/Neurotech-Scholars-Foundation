import React from "react";
import flyer from "/assets/TNT-Comp2.png";
import Swal from "sweetalert2";

const TxNT = () => {
   const API_ENDPOINT = "https://irhd1lkzmi.execute-api.us-east-1.amazonaws.com";

   const onSubmit = async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
         const res = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: json,
         });

         const responseData = await res.json();

         if (res.ok && responseData.success) {
            Swal.fire({
               title: "Submission Received!",
               text: "Thank you for registering!",
               icon: "success",
            });
            event.target.reset();
         } else {
            console.error("Form submission failed:", responseData);
            Swal.fire({
               title: "Submission Error",
               text: responseData.error || "Could not submit registration. Please try again later.",
               icon: "error",
            });
         }
      } catch (error) {
         console.error("Error submitting form:", error);
         Swal.fire({
            title: "Network Error",
            text: "Could not connect to the server. Please check your connection and try again.",
            icon: "error",
         });
      }
   };

   return (
      <div className="relative items-center justify-center min-h-screen w-full bg-gradient-to-bl from-[#044559] via-[#548291] to-[#f4f1de]">
         <div className="text-center py-10">
            <h1 className="text-white text-6xl font-bold underline decoration-[#f4f1de] underline-offset-8">
               Texas Neurotech BCI Competition!
            </h1>
            <div className="mt-10 flex py-10 px-20">
               <img className="h-[350px] mr-10" src={flyer} alt="TNT Flyer" />
               <div className="text-white ml-10 text-2xl">
                  Ready to push the boundaries of brain-computer interface
                  technology? LHNT presents the Texas Neurotech BCI Competition
                  on July 22nd!
                  <br />
                  <br />
                  This exciting event brings together the brightest minds in
                  neurotechnology to showcase innovative brain-computer
                  interface solutions. Whether you're a seasoned developer, a
                  neuroscience enthusiast, or a curious student looking to
                  explore the cutting edge of human-machine interaction, this
                  competition offers the perfect platform to demonstrate your
                  skills. Compete alongside fellow innovators in creating,
                  refining, and demonstrating BCI applications that could shape
                  the future of how we interact with technology using our minds.
                  <br />
                  <br />
                  For complete details on registration, competition guidelines,
                  prizes, and more, sign up below!
               </div>
            </div>
         </div>

         {/* The Form */}
         <section
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               minHeight: "100vh",
            }}
         >
            <div
            // style={{
            //    backgroundColor: "white",
            //    padding: "2rem",
            //    borderRadius: "10px",
            //    width: "100%",
            //    maxWidth: "600px",
            // }}
            >
               <form onSubmit={onSubmit}>
                  <div className="input-box">
                     <label htmlFor="txnt-club-name">Club Name</label>
                     <input
                        id="txnt-club-name"
                        type="text"
                        className="field"
                        placeholder="Enter your club name"
                        name="club_name"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label htmlFor="txnt-university">Affiliated University</label>
                     <input
                        id="txnt-university"
                        type="text"
                        className="field"
                        placeholder="Enter your university name"
                        name="university"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label htmlFor="txnt-representative">Club Representative</label>
                     <input
                        id="txnt-representative"
                        type="text"
                        className="field"
                        placeholder="Enter the representative's name"
                        name="representative"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label htmlFor="txnt-contact-email">Contact Email</label>
                     <input
                        id="txnt-contact-email"
                        type="email"
                        className="field"
                        placeholder="Enter contact email"
                        name="contact_email"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label htmlFor="txnt-project-desc">Brief Description of Project (2-3 sentences)</label>
                     <textarea
                        id="txnt-project-desc"
                        name="project_description"
                        className="field mess"
                        placeholder="Describe your project..."
                        required
                     ></textarea>
                  </div>

                  <div className="input-box">
                     <label htmlFor="txnt-questions">Questions?</label>
                     <textarea
                        id="txnt-questions"
                        name="questions"
                        className="field mess"
                        placeholder="Any questions?"
                        required
                     ></textarea>
                  </div>

                  <button
                     type="submit"
                     style={{
                        backgroundColor: "#e2997c",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "10px",
                     }}
                  >
                     Submit Registration
                  </button>
               </form>
            </div>
         </section>
      </div>
   );
};

export default TxNT;
