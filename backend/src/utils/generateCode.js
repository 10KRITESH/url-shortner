import { nanoid } from 'nanoid';

const generateCode = (length = 5) => nanoid(length);

export default generateCode;
