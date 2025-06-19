import React, { useState } from "react";
import "./Contact.css"; // Reuse the contact styling
import Swal from "sweetalert2";

const Submit = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   
   // Store API endpoints
   const API_ENDPOINT = "https://b2zy5l7hi2.execute-api.us-east-1.amazonaws.com/prod/submit"; // Small files
   const PRESIGNED_URL_ENDPOINT = "https://b2zy5l7hi2.execute-api.us-east-1.amazonaws.com/prod/presigned-url"; // Get S3 URL
   const LARGE_FILE_SUBMIT_ENDPOINT = "https://b2zy5l7hi2.execute-api.us-east-1.amazonaws.com/prod/submit-large"; // Large file notification
   
   // File size threshold for S3 uploads (5MB)
   const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

   const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
         // Check file size - much higher limit now with S3 support
         const maxSize = 500 * 1024 * 1024; // 500MB limit
         if (file.size > maxSize) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
            const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
            
            Swal.fire({
               title: "File Too Large",
               html: `
                  <p>Your file is <strong>${fileSizeMB} MB</strong></p>
                  <p>Maximum allowed size: <strong>${maxSizeMB} MB</strong></p>
                  <p>Please compress your file further or use a smaller file.</p>
                  <br>
                  <p><small>💡 <strong>Tip:</strong> Try removing large video files, using lower quality audio, or splitting into multiple submissions.</small></p>
               `,
               icon: "error",
               confirmButtonText: "Choose Different File"
            });
            event.target.value = '';
            setSelectedFile(null);
            return;
         }
         
         // Inform about upload method for large files
         if (file.size > LARGE_FILE_THRESHOLD) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
            
            Swal.fire({
               title: "Large File Detected",
               html: `
                  <p>Your file is <strong>${fileSizeMB} MB</strong></p>
                  <p>📁 <strong>Large files will be uploaded via secure cloud storage</strong></p>
                  <p>✅ This ensures reliable uploads for files over 5MB</p>
                  <p>⏱️ Upload may take a few moments depending on your connection</p>
               `,
               icon: "info",
               confirmButtonText: "Continue with Upload"
            }).then(() => {
               setSelectedFile(file);
            });
            return;
         }
         
         // Check file type
         const allowedTypes = ['.zip', '.rar', '.7z', '.tar', '.gz'];
         const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
         
         if (!allowedTypes.includes(fileExtension)) {
            Swal.fire({
               title: "Invalid File Type",
               text: "Please upload a compressed file (.zip, .rar, .7z, .tar, .gz)",
               icon: "error",
            });
            event.target.value = '';
            setSelectedFile(null);
            return;
         }
         
         setSelectedFile(file);
      }
   };

   // Function to upload file directly to S3 using presigned URL
   const uploadToS3 = async (file, presignedUrl, onProgress) => {
      return new Promise((resolve, reject) => {
         const xhr = new XMLHttpRequest();
         
         xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
               const percentComplete = (event.loaded / event.total) * 100;
               onProgress(percentComplete);
            }
         });
         
         xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
               resolve();
            } else {
               reject(new Error(`S3 upload failed with status ${xhr.status}`));
            }
         });
         
         xhr.addEventListener('error', () => {
            reject(new Error('S3 upload failed due to network error'));
         });
         
         xhr.open('PUT', presignedUrl);
         xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
         xhr.send(file);
      });
   };

   // Function to handle large file submission via S3
   const submitLargeFile = async (formData, file) => {
      const startTime = Date.now();
      
      try {
         // Step 1: Get presigned URL
         console.log("🔗 Getting presigned URL for large file...");
         
         const presignedPayload = {
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type || 'application/octet-stream',
            teamName: formData.get('team_name')
         };
         
         console.log("Presigned URL request:", {
            endpoint: PRESIGNED_URL_ENDPOINT,
            payload: presignedPayload
         });
         
         const presignedResponse = await fetch(PRESIGNED_URL_ENDPOINT, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(presignedPayload)
         });

         if (!presignedResponse.ok) {
            let errorData;
            try {
               errorData = await presignedResponse.json();
            } catch (e) {
               errorData = { error: `HTTP ${presignedResponse.status}: ${presignedResponse.statusText}` };
            }
            
            console.error("Presigned URL request failed:", {
               status: presignedResponse.status,
               statusText: presignedResponse.statusText,
               errorData
            });
            
            throw new Error(errorData.error || errorData.message || `Failed to get upload URL (HTTP ${presignedResponse.status})`);
         }

         const { uploadUrl, s3Key, downloadUrl } = await presignedResponse.json();
         
         // Step 2: Upload file to S3 with progress
         console.log("📤 Uploading file to S3...");
         
         let progressInterval;
         const progressDialog = Swal.fire({
            title: 'Uploading Large File',
            html: `
               <div style="margin: 20px 0;">
                  <div style="background: #f0f0f0; border-radius: 10px; overflow: hidden; margin: 10px 0;">
                     <div id="progress-bar" style="width: 0%; height: 20px; background: linear-gradient(45deg, #2196F3, #21CBF3); transition: width 0.3s;"></div>
                  </div>
                  <p id="progress-text">Preparing upload...</p>
                  <p style="font-size: 14px; color: #666;">File: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)</p>
               </div>
            `,
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
               Swal.showLoading();
            }
         });

         await uploadToS3(file, uploadUrl, (progress) => {
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            
            if (progressBar && progressText) {
               progressBar.style.width = `${progress}%`;
               progressText.textContent = `Uploading... ${Math.round(progress)}%`;
            }
         });

         // Step 3: Notify backend about the uploaded file
         console.log("📧 Sending submission notification...");
         
         const submissionData = {
            team_name: formData.get('team_name'),
            university: formData.get('university'),
            team_leader: formData.get('team_leader'),
            contact_email: formData.get('contact_email'),
            team_members: formData.get('team_members'),
            project_title: formData.get('project_title'),
            project_description: formData.get('project_description'),
            file_name: file.name,
            file_size: file.size,
            s3_download_url: downloadUrl,
            s3_key: s3Key
         };

         const notificationResponse = await fetch(LARGE_FILE_SUBMIT_ENDPOINT, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData)
         });

         const duration = Date.now() - startTime;
         Swal.close();

         if (!notificationResponse.ok) {
            const errorData = await notificationResponse.json();
            throw new Error(errorData.error || 'Failed to process submission');
         }

         const responseData = await notificationResponse.json();

         console.log("✅ Large file submission completed successfully");

         Swal.fire({
            title: "Large File Submission Successful! 🎉",
            html: `
               <p>Your competition submission has been uploaded and processed.</p>
               <p><strong>File:</strong> ${file.name}</p>
               <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(1)} MB</p>
               <p><strong>Upload time:</strong> ${Math.round(duration / 1000)}s</p>
               <p><strong>Submission ID:</strong> ${responseData.submissionId || 'N/A'}</p>
               <br>
               <p>You'll receive a confirmation email shortly at <strong>${formData.get('contact_email')}</strong></p>
               <p style="font-size: 14px; color: #666;">Your file is stored securely and will be available for review by competition judges.</p>
            `,
            icon: "success",
            confirmButtonText: "Great!"
         });

         return true;

      } catch (error) {
         const duration = Date.now() - startTime;
         console.error("Large file submission error:", error);
         
         Swal.close();
         
         Swal.fire({
            title: "Large File Upload Failed",
            html: `
               <p>${error.message}</p>
               <p><strong>Duration:</strong> ${Math.round(duration / 1000)}s</p>
               <p>Please try again or contact support if the problem persists.</p>
            `,
            icon: "error",
            confirmButtonText: "Try Again"
         });
         
         return false;
      }
   };

   const onSubmit = async (event) => {
      event.preventDefault();
      
      if (!selectedFile) {
         Swal.fire({
            title: "No File Selected",
            text: "Please select a file to submit",
            icon: "error",
         });
         return;
      }
      
      setIsSubmitting(true);
      
      const formData = new FormData(event.target);
      
      // Choose submission method based on file size
      if (selectedFile.size > LARGE_FILE_THRESHOLD) {
         console.log("📁 Large file detected, using S3 upload method");
         const success = await submitLargeFile(formData, selectedFile);
         if (success) {
            event.target.reset();
            setSelectedFile(null);
         }
         setIsSubmitting(false);
         return;
      }
      
      console.log("📧 Small file detected, using email attachment method");
      
      // Convert file to base64 for email attachment (small files only)
      const reader = new FileReader();
      reader.onload = async () => {
         const startTime = Date.now();
         
         try {
            const base64File = reader.result.split(',')[1]; // Remove data:... prefix
            
            const submissionData = {
               team_name: formData.get('team_name'),
               university: formData.get('university'),
               team_leader: formData.get('team_leader'),
               contact_email: formData.get('contact_email'),
               team_members: formData.get('team_members'),
               project_title: formData.get('project_title'),
               project_description: formData.get('project_description'),
               file_name: selectedFile.name,
               file_data: base64File,
               file_size: selectedFile.size
            };

            console.log("🚀 Starting submission...", {
               fileSize: selectedFile.size,
               fileName: selectedFile.name,
               endpoint: API_ENDPOINT
            });

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
               console.log("⏰ Request timeout - aborting");
               controller.abort();
            }, 45000); // 45 second timeout

            const res = await fetch(API_ENDPOINT, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(submissionData),
               signal: controller.signal
            });

            clearTimeout(timeoutId);
            const duration = Date.now() - startTime;
            console.log(`⏱️ Request completed in ${duration}ms`);

            let responseData;
            try {
               responseData = await res.json();
            } catch (parseError) {
               console.error("Failed to parse response as JSON:", parseError);
               throw new Error("Server returned invalid response format");
            }

            console.log("📥 Response:", {
               status: res.status,
               ok: res.ok,
               data: responseData
            });

            if (res.ok && responseData.success) {
               Swal.fire({
                  title: "Submission Successful! 🎉",
                  html: `
                     <p>Your competition submission has been received.</p>
                     <p><strong>Submission ID:</strong> ${responseData.submissionId || 'N/A'}</p>
                     <p><strong>Response time:</strong> ${duration}ms</p>
                     <p>You'll receive a confirmation email shortly at <strong>${formData.get('contact_email')}</strong></p>
                  `,
                  icon: "success",
                  confirmButtonText: "Great!"
               });
               event.target.reset();
               setSelectedFile(null);
            } else {
               console.error("Submission failed:", responseData);
               
               let errorMessage = "Could not submit your entry.";
               if (responseData.error) {
                  errorMessage = responseData.error;
               } else if (res.status === 400) {
                  errorMessage = "Invalid submission data. Please check all fields.";
               } else if (res.status === 500) {
                  errorMessage = "Server error. Please try again in a few minutes.";
               } else if (res.status === 413) {
                  errorMessage = "File too large. Please reduce file size and try again.";
               }
               
               Swal.fire({
                  title: "Submission Failed",
                  html: `
                     <p>${errorMessage}</p>
                     <p><strong>Status:</strong> ${res.status}</p>
                     <p><strong>Duration:</strong> ${duration}ms</p>
                     <details style="margin-top: 10px; text-align: left;">
                        <summary>Technical Details</summary>
                        <pre style="font-size: 11px; background: #f5f5f5; padding: 8px; border-radius: 4px; overflow: auto;">${JSON.stringify(responseData, null, 2)}</pre>
                     </details>
                  `,
                  icon: "error",
                  confirmButtonText: "Try Again"
               });
            }
         } catch (error) {
            const duration = Date.now() - startTime;
            console.error("Error submitting form:", error);
            
            let errorTitle = "Submission Error";
            let errorMessage = "An unexpected error occurred.";
            
            if (error.name === 'AbortError') {
               errorTitle = "Request Timeout";
               errorMessage = "The submission took too long to process. This might be due to a large file size or server issues.";
            } else if (error.message.includes('fetch')) {
               errorTitle = "Network Error";
               errorMessage = "Could not connect to the server. Please check your internet connection.";
            } else if (error.message.includes('JSON')) {
               errorTitle = "Server Error";
               errorMessage = "The server returned an invalid response. Please try again.";
            }
            
            Swal.fire({
               title: errorTitle,
               html: `
                  <p>${errorMessage}</p>
                  <p><strong>Duration:</strong> ${duration}ms</p>
                  <details style="margin-top: 10px; text-align: left;">
                     <summary>Technical Details</summary>
                     <pre style="font-size: 11px; background: #f5f5f5; padding: 8px; border-radius: 4px;">${error.message}</pre>
                  </details>
               `,
               icon: "error",
               confirmButtonText: "Try Again"
            });
         } finally {
            setIsSubmitting(false);
         }
      };
      
      reader.onerror = (error) => {
         console.error("File reading error:", error);
         setIsSubmitting(false);
         Swal.fire({
            title: "File Error",
            text: "Could not read the selected file. Please try selecting it again.",
            icon: "error",
         });
      };
      
      reader.readAsDataURL(selectedFile);
   };

   return (
      <section className="contact" style={{ backgroundColor: "#598392" }}>
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
               <h1 style={{ color: "#FFF8D6", marginBottom: "1rem" }}>
                  Texas Neurotech Competition Submission Portal
               </h1>
               <p style={{ color: "#FFF8D6", fontSize: "1.1rem", maxWidth: "800px", margin: "0 auto" }}>
                  Submit your competition entry below. Please include all project files in a compressed archive (.zip, .rar, etc.).
               </p>
            </div>

         <form
            onSubmit={onSubmit}
            style={{ backgroundColor: "white", borderRadius: "10px", maxWidth: "800px", margin: "0 auto" }}
         >
            <h2>Competition Submission</h2>
            
            <div className="input-box">
               <label htmlFor="team-name">Team Name *</label>
               <input
                  id="team-name"
                  type="text"
                  className="field"
                  placeholder="Enter your team name"
                  name="team_name"
                  required
               />
            </div>
            
            <div className="input-box">
               <label htmlFor="university">University/Institution *</label>
               <input
                  id="university"
                  type="text"
                  className="field"
                  placeholder="Enter your university or institution"
                  name="university"
                  required
               />
            </div>
            
            <div className="input-box">
               <label htmlFor="team-leader">Team Leader Name *</label>
               <input
                  id="team-leader"
                  type="text"
                  className="field"
                  placeholder="Enter team leader's name"
                  name="team_leader"
                  required
               />
            </div>
            
            <div className="input-box">
               <label htmlFor="contact-email">Contact Email *</label>
               <input
                  id="contact-email"
                  type="email"
                  className="field"
                  placeholder="Enter contact email"
                  name="contact_email"
                  required
               />
            </div>
            
            <div className="input-box">
               <label htmlFor="team-members">Team Members</label>
               <textarea
                  id="team-members"
                  name="team_members"
                  className="field"
                  placeholder="List all team members (optional)"
                  rows="3"
               ></textarea>
            </div>
            
            <div className="input-box">
               <label htmlFor="project-title">Project Title *</label>
               <input
                  id="project-title"
                  type="text"
                  className="field"
                  placeholder="Enter your project title"
                  name="project_title"
                  required
               />
            </div>
            
            <div className="input-box">
               <label htmlFor="project-description">Project Description *</label>
               <textarea
                  id="project-description"
                  name="project_description"
                  className="field mess"
                  placeholder="Briefly describe your project (max 500 words)"
                  required
                  maxLength="2500"
               ></textarea>
            </div>
            
            <div className="input-box">
               <label htmlFor="submission-file">Project Files * (Max 500MB)</label>
               <input
                  id="submission-file"
                  type="file"
                  className="field"
                  onChange={handleFileChange}
                  accept=".zip,.rar,.7z,.tar,.gz"
                  required
               />
               <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                  Please upload a compressed file (.zip, .rar, .7z, .tar, .gz) containing all your project materials.
                  <br />
                  📧 <strong>Small files (&lt;5MB):</strong> Sent via email attachment
                  <br />
                  ☁️ <strong>Large files (≥5MB):</strong> Uploaded to secure cloud storage
                  <br />
                  <strong>Maximum file size: 500MB</strong>
               </small>
               {selectedFile && (
                  <div style={{ 
                     marginTop: "0.5rem", 
                     color: selectedFile.size > LARGE_FILE_THRESHOLD ? "#2196F3" : "#2e7d3d",
                     fontWeight: "bold" 
                  }}>
                     ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                     {selectedFile.size > LARGE_FILE_THRESHOLD ? (
                        <span style={{ color: "#2196F3", marginLeft: "8px" }}>☁️ Cloud upload</span>
                     ) : (
                        <span style={{ color: "#2e7d3d", marginLeft: "8px" }}>📧 Email attachment</span>
                     )}
                  </div>
               )}
            </div>
            
            <button type="submit" disabled={isSubmitting}>
               {isSubmitting ? "Submitting..." : "Submit Entry"}
            </button>
         </form>
      </section>
   );
};

export default Submit; 