const stubNotification = {
  id: '',
  title: 'Zero',
  body: 'You were mentioned in #Product',
  createdAt: '2023-03-13T22:33:34.945Z',
  originUser: {
    id: 'b7b11fbb-0734-4987-b5fc-d4aec19a5eb6',
    profileSummary: {
      id: '338785c1-310a-4a0e-9e93-59a04b20b400',
      firstName: 'Dale',
      lastName: 'Stub',
      profileImage: 'https://res.cloudinary.com/fact0ry-dev/image/upload/v1623021591/zero-assets/avatars/pfp-18.jpg',
    },
  },
};

const stubNotifications = Array.from(Array(10).keys()).map((v) => {
  return { ...stubNotification, id: v };
});

export async function fetchNotifications() {
  return stubNotifications;
}
