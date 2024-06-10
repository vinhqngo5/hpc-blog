import React from 'react';
export default function BlogPostItemContainer({children, className}) {
  return <article className={className + ' center_blogpostitem_container'}  >{children}</article>;
}
