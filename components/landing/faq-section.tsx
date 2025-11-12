import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FAQSection() {
  const faqs = [
    {
      question: 'Preciso saber mexer em BI?',
      answer: 'Não. A ideia da Reliora é justamente fugir da complexidade de ferramentas de BI. Você conecta as contas, escolhe o período e a IA monta o relatório para você.',
    },
    {
      question: 'A IA pode errar?',
      answer: 'Ela parte dos dados reais, mas como qualquer ferramenta, pode interpretar de forma diferente do que você faria. Por isso, você sempre pode revisar e editar o texto antes de enviar.',
    },
    {
      question: 'Meu cliente vai saber que é IA?',
      answer: 'Não, a menos que você queira deixar isso claro. O foco é parecer um relatório humano bem feito, só que muito mais rápido.',
    },
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim. O modelo é de assinatura mensal, sem fidelidade. Se a Reliora não estiver ajudando de verdade, você pode cancelar sem multa.',
    },
  ]

  return (
    <section className="bg-gray-50 py-20 sm:py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl mb-12">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold text-[#0F172A]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
