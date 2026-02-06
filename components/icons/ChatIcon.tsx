import React from 'react';
const ChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.26c-.34.024-.664.18-.897.439l-2.066 2.066c-.29.29-.682.46-.99.46-.308 0-.699-.17-.99-.46L8.334 17.6c-.234-.259-.557-.415-.897-.439l-3.722-.26C2.59 16.899 1.75 15.935 1.75 14.8V10.511c0-.97.616-1.813 1.5-2.097l6.625-1.503c.337-.076.686-.076 1.023 0l6.625 1.503zM7.5 10.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);
export default ChatIcon;