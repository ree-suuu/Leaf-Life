export const MVP_PLANTS = [
  {
    name: 'ZZ Plant',
    type: 'buy',
    price: '$15',
    location: 'Local Nursery',
    image: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=400',
    space_tag: 'indoor,balcony', 
    sunlight_need: '1', 
    min_temp: 15,
    max_temp: 32,
    purification_score: 8
  },
  {
    name: 'Snake Plant',
    type: 'buy',
    price: '$12',
    location: 'Local Nursery',
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf7?auto=format&fit=crop&q=80&w=400',
    space_tag: 'indoor,balcony,rooftop,garden', // The Universal Plant
    sunlight_need: '1', // Level 1 covers 1, 2, and 3
    min_temp: 5, // Extra hardy for Nepal winters
    max_temp: 38,
    purification_score: 10
  },
  {
    name: 'Peace Lily',
    type: 'buy',
    price: '$18',
    location: 'Local Nursery',
    image: 'https://images.unsplash.com/photo-1599385846173-326241a49ec5?auto=format&fit=crop&q=80&w=400',
    space_tag: 'indoor,balcony', // Can be in balcony if shaded
    sunlight_need: '2', // Needs at least Medium
    min_temp: 18,
    max_temp: 30,
    purification_score: 9
  },
  {
    name: 'Jade Plant',
    type: 'buy',
    price: '$10',
    location: 'Local Nursery',
    image: 'https://images.unsplash.com/photo-1610024103911-9f223126be8e?auto=format&fit=crop&q=80&w=400',
    space_tag: 'indoor,balcony,rooftop,garden', // High light indoor or any outdoor
    sunlight_need: '3', // Needs High light
    min_temp: 10,
    max_temp: 35,
    purification_score: 6
  },
  {
    name: 'Aloe Vera',
    type: 'buy',
    price: '$8',
    location: 'Local Nursery',
    image: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=400',
    space_tag: 'balcony,rooftop,garden',
    sunlight_need: '3',
    min_temp: 10,
    max_temp: 40,
    purification_score: 7
  }
];
