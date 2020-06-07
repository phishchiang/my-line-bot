const guessRes = (guessNum, magicNum) => {
  guessNum = parseInt(guessNum.toLowerCase().split('guess')[1]);
  if (guessNum > magicNum) {
    console.log('太大了');
    return '太大了';
  } else if (guessNum < magicNum) {
    console.log('太小了');
    return '太小了';
  } else if (guessNum === magicNum) {
    console.log('答對了');
    winner = true;
    return '答對了';
  }
};

module.exports = {
  guessRes,
};
