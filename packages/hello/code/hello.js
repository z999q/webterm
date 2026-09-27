export default {
  description: "Print an ASCII WebTerm robot",

  execute(args, terminal) {
    const art = `
      ┌─────────────────────┐
      │      WEBTERM        │
      │                     │
      │      ┌─────┐        │
      │      │ ◉ ◉ │        │
      │      │  ▽  │        │
      │      └─────┘        │
      │        ║ ║           │
      │      ┌─╨─╨─┐         │
      │      │ HELLO│         │
      │      └──────┘         │
      │                     │
      └─────────────────────┘
`;

    terminal.print(art);
    terminal.print("Hello from WebTerm!");
  }
};
