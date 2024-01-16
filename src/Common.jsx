export default function CommonHelper() {

    const deepCopy = (value) => {
        return JSON.parse(JSON.stringify(value));
    }

    return {
        deepCopy
    };
};