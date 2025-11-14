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
  notificationsCount: {
    "0": "You have no notifications",
    "1": "You have one notification",
    "[notificationsCount] >= 2 && [notificationsCount] <= 10":
      "You have [notificationsCount] notifications",
    "[notificationsCount] > 10": "You have many notifications",
  },
  status: {
    active: "Your account is active",
    inactive: "Your account is inactive",
    pending: "Your account is pending approval",
  },
  premium: {
    true: "You have premium access",
    false: "Upgrade to premium",
  },
  pagination: {
    rowsPerPage: "Rows per page",
    selected: {
      "0": "No rows selected",
      "1": "1 row selected of [total]",
      "[selected] === [total]": "All [total] rows selected",
      "[selected] > 1 && [selected] < [total]":
        "[selected] of [total] rows selected",
    },
    page: "Page",
    of: "of",
  },
};
