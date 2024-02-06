import * as yup from "yup";

const validation = (url, links) => {
    const schema = yup.string()
        .trim()
        .url()
        .required()
        .notOneOf(links)
        .validate(url)
    return schema;
};

export default validation