import { useState } from 'react'
import AccordionItem from './AccordionItem'

export default function Accordion({
  items,
  defaultOpen = null,
  className = '',
  containerClass = '',
}) {
  const [openId, setOpenId] = useState(defaultOpen)

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className={`card divide-y divide-slate-200 ${containerClass}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.title}
          subtitle={item.subtitle}
          icon={item.icon}
          content={item.content}
          isOpen={openId === item.id}
          onToggle={handleToggle}
          headerClass={item.headerClass}
          contentClass={item.contentClass}
        />
      ))}
    </div>
  )
}
