import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa'; // Ícone para fechar o modal

const ArtList = ({ isOpen, onClose, itemsPromise, title }) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Só carrega as obras se o modal for aberto e as obras ainda não foram carregadas
        if (isOpen && items.length === 0) {
            setIsLoading(true);
            itemsPromise.then(loadedItems => {
                setItems(loadedItems);
                setIsLoading(false);
            });
        }
    }, [isOpen, itemsPromise, items.length]);

    if (!isOpen) {
        return null;
    }

    return (
        // O overlay que cobre a tela
        <div className="art-list-modal-overlay" onClick={onClose}>
            {/* O conteúdo do modal */}
            <div className="art-list-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Cabeçalho do Modal */}
                <div className="art-list-header">
                    <h2 className="art-list-title">{title}</h2>
                    <button className="art-list-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                {/* Grid de Obras */}
                {isLoading ? (
                    <div className="art-list-loading">Carregando obras...</div>
                ) : (
                    // Este é o container que permite o scroll e o layout masonry
                    <div className="art-list-masonry-container"> 
                        {items
                            .filter(i => i?.thumbnail_id) // Garante que a obra tenha uma miniatura
                            .map((item) => (
                                // O "card" da obra
                                <div
                                    key={item.id}
                                    className="art-list-item"
                                >
                                    <img
                                        src={item.thumbnail?.full[0]}
                                        alt={item.title}
                                        className="art-list-item-image"
                                    />
                                    {/* O overlay com o título */}
                                    <div className="art-list-item-overlay">
                                        <h4 className="art-list-item-title">{item.title}</h4>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ArtList;