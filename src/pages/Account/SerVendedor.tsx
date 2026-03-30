const SerVendedor = () => {
    return (
        <div className=" space-y-4 not-only:bg-white rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Tornar-se Vendedor</h2>
            <p className="text-gray-600 mb-4">
                Transforme sua loja em uma plataforma de vendas online e alcance mais clientes.
            </p>


            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Benefícios de ser um vendedor:</h3>
                <ul className="list-disc list-inside text-gray-600">
                    <li>Acesso a uma base de clientes em crescimento.</li>
                    <li>Ferramentas de gerenciamento de produtos e pedidos.</li>
                    <li>Suporte dedicado para vendedores.</li>
                </ul>
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Como funciona:</h3>
                <p className="text-gray-600">
                    É muito simples! Basta preencher o formulário de solicitação e nossa equipe entrará em contato com você.
                </p>
            </div>

            <button onClick={() => (window.location.href = '/cadastro_vendedor')} className="bg-blue-500 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-600 transition">
                Solicitar Cadastro
            </button>

        </div>
    );
};

export default SerVendedor;