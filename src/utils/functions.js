const resizeHandler = (setWidth) => {
  setWidth(window.innerWidth);
};

const clickHandlerAccount = (event) => {
  event.stopPropagation();
  const accountInfo = document.getElementById('sidebar');
  accountInfo.classList.add('active');
};

export { clickHandlerAccount, resizeHandler };
