export const en = {
  home: {
    greetings: "Hello [name]",
    title: "welcome to my site",
  },
  profile: {
    greetings: {
      default: "Hello [name]",
      gender: {
        male: {
          "[age] >= 18": "Hello Mr [name]",
        },
        female: {
          "[age] >= 18": "Hello Ms [name]",
        },
        noBinary: {
          "[age] >= 18": "Hello Mx [name]",
        },
      },
    },
    vote: {
      "[age] >= 18": "you are old enough to vote",
      "[age] < 18": "you are too young to vote",
    },
  },
};
