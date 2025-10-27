export type Feedback = {
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export type Product = {
  id: string;
  artName: string;
  price: number;
  description?: string;
  glassSurface?: boolean;
  image: string;
  brand: string;
  limitedTimeDeal: number;
  feedbacks?: Feedback[];
};
