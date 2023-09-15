declare type User = {
    id: string;
    email: string;
    firstname : string;
    surname : string;
    dob : string;
    gender : string;
    activated : boolean;
  };

declare type NewUser = {
    email: string;
    firstname : string;
    surname : string;
    dob : string;
    gender : string;
    password : string;
    activated:boolean;
  };