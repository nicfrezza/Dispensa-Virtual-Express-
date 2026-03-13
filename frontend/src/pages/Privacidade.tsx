const Privacidade = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
            <p className="mb-4">
                Última atualização: 13 de março de 2026
            </p>

            <p className="mb-4">
                Na Dispensa Express, valorizamos a privacidade dos nossos clientes. Esta política de privacidade explica como coletamos, usamos e protegemos suas informações pessoais.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Informações que Coletamos</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Informações de cadastro: nome, email, telefone, endereço.</li>
                <li>Dados de pagamento: informações do cartão de crédito ou débito.</li>
                <li>Dados de navegação: cookies e histórico de compras para melhorar sua experiência.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Como Usamos Suas Informações</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Processar pedidos e gerenciar sua conta.</li>
                <li>Enviar atualizações sobre seu pedido e promoções.</li>
                <li>Melhorar nossos serviços e personalizar sua experiência de compra.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Proteção de Dados</h2>
            <p className="mb-4">
                Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração ou divulgação. Utilizamos criptografia e firewalls para garantir a segurança dos seus dados.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Seus Direitos</h2>
            <p className="mb-4">
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Para exercer esses direitos, entre em contato conosco através do email:
                <a href="mailto:privacidade@dispensaexpress.com" className="text-blue-600 hover:underline">
                    privacidade@dispensaexpress.com
                </a>
            </p>
        </div>
    )
};

export default Privacidade();