import React from "react";
import "./Contact.css";
import Swal from "sweetalert2";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Contact = () => {
   // Store API endpoint in a variable (consider moving to .env file later)
   const API_ENDPOINT = "https://irhd1lkzmi.execute-api.us-east-1.amazonaws.com"; // Updated URL

   const onSubmit = async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      // Clear previous alerts/state if necessary (optional)

      try {
        const res = await fetch(API_ENDPOINT, { // Use the new API endpoint
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              // No Accept header needed unless your API specifically requires it
          },
          body: json,
        });

        const responseData = await res.json(); // Always parse JSON response

        if (res.ok && responseData.success) { // Check HTTP status and success flag
            Swal.fire({
              title: "Message Sent!",
              text: "We'll get back to you shortly!",
              icon: "success",
            });
            event.target.reset();
        } else {
           // Handle error response from Lambda/Resend
           console.error("Form submission failed:", responseData);
           Swal.fire({
              title: "Submission Error",
              text: responseData.error || "Could not send message. Please try again later.",
              icon: "error",
            });
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        // Handle network errors or other fetch issues
        Swal.fire({
           title: "Network Error",
           text: "Could not connect to the server. Please check your connection and try again.",
           icon: "error",
        });
      }
   };

   return (
      <section className="contact" style={{ backgroundColor: "#598392" }}>
         {/* Social Media Icons */}
         <div
            className="social-media"
            style={{
               marginBottom: "2rem",
               display: "flex",
               justifyContent: "center",
               gap: "2rem",
               paddingTop: "2rem",
            }}
         >
            <a
               href="https://www.linkedin.com/company/lhneurotech/"
               target="_blank"
               rel="noopener noreferrer"
               style={{ color: "#FFF8D6", fontSize: "2rem" }}
            >
               <FaLinkedin className="social-icon" />
            </a>
            <a
               href="https://www.instagram.com/lhneurotech/"
               target="_blank"
               rel="noopener noreferrer"
               style={{ color: "#FFF8D6", fontSize: "2rem" }}
            >
               <FaInstagram className="social-icon" />
            </a>
         </div>

         <form
            onSubmit={onSubmit}
            style={{ backgroundColor: "white", borderRadius: "10px" }}
         >
            <h2>Contact Us</h2>
            <div className="input-box">
               <label htmlFor="contact-name">Full Name</label>
               <input
                  id="contact-name"
                  type="text"
                  className="field"
                  placeholder="Enter your name"
                  name="name"
                  required
               />
            </div>
            <div className="input-box">
               <label htmlFor="contact-email">Email Address</label>
               <input
                  id="contact-email"
                  type="email"
                  className="field"
                  placeholder="Enter your email"
                  name="email"
                  required
               />
            </div>
            <div className="input-box">
               <label htmlFor="contact-organization">Organization/Company</label>
               <input
                  id="contact-organization"
                  type="text"
                  className="field"
                  placeholder="Enter your organization"
                  name="organization"
                  required
               />
            </div>
            <div className="input-box">
               <label htmlFor="contact-message">Your Message</label>
               <textarea
                  id="contact-message"
                  name="message"
                  className="field mess"
                  placeholder="Enter your message"
                  required
               ></textarea>
            </div>
            <button type="submit">Send Message</button>
         </form>
      </section>
   );
};

export default Contact;
