export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  MonthSelection: { year: number };
  MagazineDetails: { year: number; month: string };
  AudioPlayer: { year: number, month: string, audioData: AudioData[] };
};


export interface CartItem {
  bookId: number;
  quantity: number;
}

export interface Magazine {
  year: number;
  month: number;
  month_eng: string;
  imgUrl: string;
  title: string;
  description: string;
  author: string;
  shortDesc: string;
  created_dt: string;
  by: string;
  category: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  imgUrl: string;
  shortdesc: string;
  description: string;
  offPrice: number;
  availability: string;
}

export interface AudioData {
  title: string;
  audio: string;
  transcript: string;
  img?: string;
}

export interface Plan {
  name: string;
  price: string;
  features: string[];
  buttonLabel: string;
  buttonStyle: {
    backgroundColor: string;
    color: string;
  };
}