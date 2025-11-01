import React from 'react'

function Paragraph(props: any) {
  return (
    <p className="text-2xl">{props.children}</p>
  )
}

export default Paragraph