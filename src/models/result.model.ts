export interface FieldError {
  field: string;
  error: string;
}

export interface Result<T> {
  status: number;
  code: string;
  message: string;
  data?: T;
  fieldErrors?: FieldError[];
}
