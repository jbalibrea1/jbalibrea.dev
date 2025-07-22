import { useEffect, useRef } from "react";

const messages = [
  "Hey!",
  "Hola!",
  "Saludos!",
  "Qué tal?",
  "Hello!",
  "Hi!",
  "Bienvenido!",
];

export default function AboutMeMessage() {
  const el = useRef(null);

  useEffect(() => {
    const msg = messages[Math.floor(Math.random() * messages.length)];
    let i = 0;
    function type() {
      if (i <= msg.length) {
        if (el.current) {
          el.current.textContent = msg.slice(0, i);
          i++;
          setTimeout(type, 50);
        }
      }
    }
    type();
  }, []);

  return (
    <span id="msg" ref={el} className="transition text-mutedfg"></span>
  );
}
