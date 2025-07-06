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
  <div className="bg-gradient-to-r from-yellow-200 to-orange-400 text-gray-900 py-16">
    <div className="max-w-4xl mx-auto px-6 space-y-12">
      
      {/* About Section */}
      <section className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to <span className="text-orange-600">TicketFlix</span></h1>
        <p className="text-lg mb-6">
          TicketFlix is your one‑stop destination for discovering and booking movie tickets with zero hassle. 
          From the latest blockbusters to indie gems, our platform brings the full cinema experience to your fingertips.
        </p>
        <p className="text-base leading-relaxed">
          <strong>Why TicketFlix?</strong>  
          <ul className="list-disc list-inside mt-2 space-y-1 text-left inline-block">
            <li><strong>Smart Search:</strong> Filter by genre, language, showtime, or theater amenities in one click.</li>
            <li><strong>Instant Seat Selection:</strong> See real‑time seat availability and lock in your favorites.</li>
            <li><strong>Mobile-First Design:</strong> Book on the go with a responsive interface tailored for all devices.</li>
            <li><strong>Secure Payments:</strong> Multiple payment options with bank‑grade encryption.</li>
          </ul>
        </p>
        <p className="text-base leading-relaxed mt-4">
          Since our inception, we've served thousands of happy movie‑lovers. Our mission is simple: make movie booking
          faster, friendlier, and more fun.
        </p>
      </section>

      {/* Gallery Section */}
      <section>
        <h2 className="text-3xl font-semibold text-center mb-8">A Glimpse Behind the Scenes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-48 bg-cover bg-center rounded-lg shadow-lg" style={{ backgroundImage: "url('/images/office1.jpg')" }}>
          </div>
          <div className="h-48 bg-cover bg-center rounded-lg shadow-lg" style={{ backgroundImage: "url('/images/office2.jpg')" }}>
          </div>
          <div className="h-48 bg-cover bg-center rounded-lg shadow-lg" style={{ backgroundImage: "url('/images/office3.jpg')" }}>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-3xl font-semibold text-center mb-8">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map(member => (
            <div
              key={member.roll}
              className="bg-white rounded-2xl p-6 text-center shadow-md transform transition hover:-translate-y-1"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-orange-500">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
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
