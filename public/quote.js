const quotes = [
  {
    quote: "당신의 몸은 해낼 수 있다. 당신의 마음만 설득하면 된다.",
  },
  {
    quote: "독서는 마음을 위한 것이고, 운동은 몸을 위한 것이다.",
  },
  {
    quote: "내가 운동하는 이유는 삶의 질을 높여 인생을 즐기기 위함이다.",
  },
  {
    quote: "포기하지 않는 사람을 이기기는 어렵다.",
  },
  {
    quote: "자기 몸을 잘 돌보라. 몸은 내 영혼의 유일한 안식처다.",
  },
  {
    quote: "운동은 하루를 짧게하지만 인생을 길게 해준다.",
  },
  {
    quote: "지금 나의 선택이 변화된 나를 만든다.",
  },
  {
    quote: "땀흘린 자에게 좋은 일이 찾아온다.",
  },
  {
    quote: "인생은 당신이 편안한 곳에서 나올 때 시작한다.",
  },
  {
    quote: "몸의 발전이 마음의 발전을 이룬다.",
  },
];

const quote = document.querySelector("#quote");
const todaysQuote = quotes[Math.floor(Math.random() * quotes.length)];

quote.innerText = todaysQuote.quote;