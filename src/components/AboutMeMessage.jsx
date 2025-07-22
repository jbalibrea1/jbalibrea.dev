import { useEffect, useRef } from 'react';

const messages = [
  'Hey!',
  'Hola!',
  'Saludos!',
  'Qué tal?',
  'Hello!',
  'Hi!',
  'Bienvenido!',
];

export default function AboutMeMessage() {
  const el = useRef(null);

  useEffect(() => {
    const msg = messages[Math.floor(Math.random() * messages.length)];

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function type() {
      for (let i = 1; i <= msg.length; i++) {
        el.current.textContent = msg.slice(0, i);
        await sleep(50);
      }
    }

    type();
  }, []);

  return <span id="msg" ref={el} className="transition text-mutedfg"></span>;
}
