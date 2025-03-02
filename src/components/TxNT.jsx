import React from "react";
import flyer from "/assets/TNT-Comp2.png";

const TxNT = () => {
   const onSubmit = async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);

      formData.append("access_key", "eb697724-19ee-45d6-8837-1b7de5c51c39");
      formData.append("email_to", "newemail@example.com");

      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      const res = await fetch("https://api.web3forms.com/submit", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
         },
         body: json,
      }).then((res) => res.json());

      if (res.success) {
         alert("Submission received. Thank you!");
         event.target.reset();
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
                     <label>Club Name</label>
                     <input
                        type="text"
                        className="field"
                        placeholder="Enter your club name"
                        name="club_name"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label>Affiliated University</label>
                     <input
                        type="text"
                        className="field"
                        placeholder="Enter your university name"
                        name="university"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label>Club Representative</label>
                     <input
                        type="text"
                        className="field"
                        placeholder="Enter the representative's name"
                        name="representative"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label>Contact Email</label>
                     <input
                        type="email"
                        className="field"
                        placeholder="Enter contact email"
                        name="contact_email"
                        required
                     />
                  </div>

                  <div className="input-box">
                     <label>Brief Description of Project (2-3 sentences)</label>
                     <textarea
                        name="project_description"
                        className="field mess"
                        placeholder="Describe your project..."
                        required
                     ></textarea>
                  </div>

                  <div className="input-box">
                     <label>Questions?</label>
                     <textarea
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
