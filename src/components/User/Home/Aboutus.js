import React from 'react';

const teamMembers = [
  {
    name: 'Antarikh Banerjee',
    role: 'Frontend Engineer',
    roll: '504123011009',
    image: require("./Bantarikh.jpeg"),
    bio: `Antarikh is the creative mind behind our sleek user interfaces. With a passion for clean code and pixel-perfect design,
          he ensures every button, every card, and every interaction feels intuitive. Outside of code, you'll find him sketching
          new UI ideas or experimenting with micro-animations.`,
  },
  {
    name: 'Debajit Ghosh',
    role: 'Backend Architect',
    roll: '504123011015',
    image:require("./Bantarikh.jpeg"),
    bio: `Debajit builds the invisible scaffolding of TicketFlix. He engineers our data models, crafts efficient APIs,
          and keeps the server humming under heavy load. When he's off duty, he’s often dissecting new database engines
          or mentoring peers on scalable system design.`,
  },
  {
    name: 'Sudipto Saha',
    role: 'Product Manager & QA Lead',
    roll: '504123011053',
    image:require("./Sudipto.jpeg"),
    bio: `Sudipto bridges the gap between vision and reality. He marshals our roadmap, coordinates sprints,
          and ensures every release meets our quality bar. A stickler for detail, he’s our first line of defense
          against bugs—and loves turning user feedback into actionable features.`,
  },
];

const Aboutus = () => (
  <div className="bg-white text-gray-900 py-10">
    <div className="max-w-4xl mx-auto px-6 space-y-12">
      
      {/* About Section */}
      <section className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to <span className="text-orange-600">TicketFlix</span></h1>
        <p className="text-lg mb-6 text-justify ">
          TicketFlix is your one‑stop destination for discovering and booking movie tickets with zero hassle. 
          From the latest blockbusters to indie gems, our platform brings the full cinema experience to your fingertips. Try the new experience now.
        </p>
        <div><p className="text-base leading-relaxed text-start mb-[-2px] ml-[6px]">
          <strong>Why TicketFlix?</strong></p>
          <div className='ml-[-40px] lg:flex justify-start'>
            <p><ul className="list-disc list-inside mt-2 space-y-1 inline-block text-left">
            <li><strong>Smart Search:</strong> Filter by genre, language, showtime, or theater amenities in one click.</li>
            <li><strong>Instant Seat Selection:</strong> See real‑time seat availability and lock in your favorites.</li>
            <li><strong>Mobile-First Design:</strong> Book on the go with a responsive interface tailored for all devices.</li>
            <li><strong>Secure Payments:</strong> Multiple payment options with bank‑grade encryption.</li>
          </ul>
        </p>
          </div>
          </div>
        <p className="text-base leading-relaxed mt-2 text-justify">
          Since our inception, we've served thousands of happy movie‑lovers. Our mission is simple: make movie booking
          faster, friendlier, and more fun. Thanks for visiting.....
        </p>
      </section>
        <hr className="my-2 border-gray-300" />
        {/* Mission Section */}
        <section className="text-center ">
        <h2 className="text-3xl font-semibold mb-4 mt-[-16px]">Our Mission</h2>
        <p className="text-lg mb-6 text-justify">    
            At TicketFlix, we believe that every movie experience should be seamless and enjoyable. Our mission is to
            revolutionize the way you discover and book movie tickets, making it as easy as a few clicks. We strive to
            provide a platform that not only simplifies the booking process but also enhances your overall cinema experience.
        </p>
        <p className="text-base leading-relaxed text-justify">
            We are committed to delivering the latest features, ensuring security, and providing exceptional customer support.
            Join us on this cinematic journey and experience the future of movie booking with TicketFlix.   
        </p>
      </section>


      {/* Team Section */}
      <section>
        <h2 className="text-3xl font-semibold text-center mb-8">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <div
              key={member.roll}
              className="bg-gradient-to-r from-yellow-200 to-orange-400 rounded-2xl p-6 text-center shadow-md transform transition hover:-translate-y-1"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-orange-500">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full my-[-5px] ml-[1px] object-fit"
                />
              </div>
              <h3 className="text-2xl font-bold">{member.name}</h3>
              <p className="text-orange-600 font-medium">{member.role}</p>
              <p className="text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  </div>
);

export default Aboutus;