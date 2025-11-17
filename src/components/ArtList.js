import { useEffect, useState } from 'react';
import { FaCompass } from 'react-icons/fa';
import { FaExpandArrowsAlt } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';

const ArtList = ({ itemsPromise }) => {
    

    const PER_PAGE = 5;
    const [offest, setOffset] = useState(0);
    const [active, setActive] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        itemsPromise.then(setItems);
    }, [])

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <FaCompass
                    onClick={() => setActive(!active)}
                    style={{
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: active ? '#007bff' : '#333',
                        transition: 'color 0.2s'
                    }}
                    title={active ? "Mostrar lista de obras" : "Esconder lista de obras"}
                />
            </div>
            {active && (
                <div>
                    <ReactPaginate
                        breakLabel="..."
                        nextLabel="⏭️"
                        onPageChange={event =>
                            setOffset((event.selected * PER_PAGE) % items.length)
                        }
                        pageRangeDisplayed={5}
                        pageCount={Math.ceil(items.length / PER_PAGE)}
                        previousLabel="⏮️"
                        renderOnZeroPageCount={null}
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                        containerClassName="pagination"
                        activeClassName="active"
                        style={{ marginBottom: '1rem' }}
                    />
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {items
                            .filter(i => i?.thumbnail_id)
                            .slice(offest, offest + PER_PAGE)
                            .map((item, index) => (
                                <div
                                    key={item.id || index}
                                    style={{
                                        border: '1px solid #eee',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        background: '#fafafa',
                                        textAlign: 'center'
                                    }}
                                >
                                    <span style={{
                                        display: 'block',
                                        fontWeight: 'bold',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {item.title}
                                    </span>
                                    <img
                                        src={item.thumbnail?.full[0]}
                                        alt={item.title}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '150px',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArtList;