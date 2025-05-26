import React, {useState} from 'react';
import emailjs from '@emailjs/browser';
import '../Home/ContactUs.css'


const ContactUs = () => {
  const[name, setName] = useState ('');
  const[email, setEmail] = useState ('');
  const[message, setMessage] = useState ('');

  const handleSubmit = (e) =>{
    e.preventDefault();

    const serviceId = 'service_94rujxh';
    const templateId = 'template_q2s4tmq';
    const publicKey = 'mgzghTuTNmIM9Hr3Z';

    const templateParams = {
      from_name: name,
      from_email: email,
      to_name: 'Ticket Flex',
      message: message,
    }

    emailjs.send(serviceId, templateId, templateParams, publicKey)
    .then((response) => {
      console.log('Email sent successfully', response)
      setName(' ')
      setEmail(' ')
      setMessage(' ')
    })
    .catch((error) => {
      console.log('Error sending email', error)
    });
  }

  return (
      <div className="card-contactus">
        <span className="title-contactus">Help & Support</span>
        <form onSubmit={handleSubmit} className="form-contactus">
          <div className="group-contactup">
            <input placeholder="Your Name"
            type="text" required
            value={name}
            onChange={(e) => setName(e.target.value)} 
            />

          </div>
          <div className="group-contactup">
            <input placeholder="Your email"
            type="email" id="email"
            name="email" required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />

          </div>
          <div className="group-contactup">
            <textarea placeholder="Your Message"
            id="comment" name="comment"
            rows={5} required defaultValue={""}
            value={message}
            onChange={(e) => setMessage(e.target.value)} />

          </div>
          <button type="submit-contactup">Submit</button>
        </form>
      </div>
  );
}

export default ContactUs;