// this function helps to check the valid img type, (only ipeg, png, jpg can be converted into base64 format)
export default function fileToDataUrl (file) {
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = validFileTypes.find(type => type === file.type);

    if (!valid) {
      throw Error('provided file is not a png, jpg or jpeg image.');
    }
  
    // read img file and convert to promise
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
  }