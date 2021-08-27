import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NumberFormat from "react-number-format";
import Alert from "../Alert";
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { Item } from "../../models/Item";
import Api, { ITEM_URL } from "../../services/api";

import styles from '../../styles/default.module.css';

const ItemComponent = () => {

    const [search, setSearch] = useState("");
    const [items, setItems] = useState([] as Item[]);
    const [itemUpd, setItemUpd] = useState({} as Item);
    const [initItems, setInitItems] = useState([] as Item[]);
    
    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState("");
    const [price, setPrice] = useState("");
    const [priceError, setPriceError] = useState("");

    const [idUpdate, setIdUpdate] = useState("");
    const [idRemove, setIdRemove] = useState("");
    
    const [btnDisableAdd, setBtnDisableAdd] = useState(false);
    const [btnTxtAdd, setBtnTxtAdd] = useState<string | object>("Adicionar");
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    const [btnDisableRemove, setBtnDisableRemove] = useState(false);
    const [btnTxtRemove, setBtnTxtRemove] = useState<string | object>("Remover");
    const [showModalRemove, setShowModalRemove] = useState(false);

    const api = new Api();

    useEffect(() => {
        
        const getItems = async () => {

            await api.get(ITEM_URL).then(res => {
                setItems(res);
                setInitItems(res);
            });
        }
        getItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initItems?.filter(cp =>
            cp.title.toLowerCase().includes(search.toLowerCase())
        );
        setItems(results);
    }, [initItems, search]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var cError = Validations.validateRequiredField(title, "nome");
        var pError = Validations.validateRequiredField(price, "preço");

        if(cError || pError)
        {
            setTitleError(cError);
            setPriceError(pError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new Item();
                model.title = title;
                model.price = Number.parseFloat(Utils.convertToCurrencyDb(price));
                
                await api.insert(ITEM_URL, model)
                .then(res => {
                    const cpn = res.data.data as Item;
                    Utils.alertLocalStorage('Item inserido com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    setItems([...items, cpn]);
                    setInitItems([...initItems, cpn]);
                    handleModalAddUpd(false);
                })
                .catch(_ => {
                    Utils.alertLocalStorage(`Ocorreu um erro ao adicionar!`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                });
            }
            else 
            {
                itemUpd.title = title;
                itemUpd.price = Number.parseFloat(Utils.convertToCurrencyDb(price));
                
                await api.update(ITEM_URL, itemUpd)
                .then(res => {
                    const cpn = res.data.data as Item;
                    Utils.alertLocalStorage('Item atualizado com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initItems.filter((x) => x.id !== cpn.id);
                    setItems([...newCpn, cpn]);
                    setInitItems([...newCpn, cpn]);
                    handleModalAddUpd(false);
                })
                .catch(_ => {
                    Utils.alertLocalStorage(`Ocorreu um erro ao atualizar!`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                });
            }
        }
    }

    const handleRemove = async () => {

        if(idRemove === '')
        {
            Utils.alertLocalStorage(`Ocorreu um erro ao remover!`, false);
            handleModalRemove(false);
        }
        else
        {   
            await api.delete(ITEM_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Item removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initItems.filter((x) => x.id !== idRemove);
                setItems(newCpn);
                setInitItems(newCpn);
                handleModalRemove(false);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage(`Ocorreu um erro ao remover!`, false);
                
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');
                handleModalRemove(false);
            });
        }
    }

    const handleModalAddUpd = async (isOpen: boolean, id: string = '') => {

        if(!isOpen)
        {
            setTitle('');
            setPrice('');
            setShowModalAdd(isOpen);
        }
        else
        {
            if(id !== '')
            {
                setBtnTxtAdd('Atualizar');
                await api.getById(ITEM_URL, id)
                .then(res => {
                    const cpn = res as Item;
                    setItemUpd(cpn);
                    setTitle(cpn.title);
                    setPrice(Utils.currencyValue(cpn.price).toString());
                    setIdUpdate(id !== '' ? id : idUpdate);
                })
                .catch(err => {
                    console.log(err);
                    Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados do item', false);
                    setShowModalAdd(false);
                });
            }
            else
            {
                setBtnTxtAdd('Adicionar');
                setIdUpdate('');
                setTitle('');
            }
            setShowModalAdd(isOpen);
        }
    }

    const handleModalRemove = (isRemove: boolean, id: string = '') => {

        setIdRemove(id !== '' ? id : idRemove);
        setShowModalRemove(isRemove);
    }

    const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
          handleAdd();
        }
    }

    return (
        <div className={`px-4`}>

            <Alert />

            <Modal 
                show={showModalAdd} 
                onHide={() => handleModalAddUpd(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Adicionar item
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>
                    <Form.Group>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o nome" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            />
                        <Form.Text className="text-danger">
                            {titleError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Preço</Form.Label>
                        <NumberFormat 
                            className={`form-control`}
                            placeholder="Digite o preço" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            decimalSeparator=','
                            thousandSeparator='.'
                            inputmode="numeric"
                        />
                        <Form.Text className="text-danger">
                            {priceError}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalAddUpd(false)}>
                        Cancelar
                    </button>
                    <button 
                        className={`button`} 
                        onClick={handleAdd}
                        disabled={btnDisableAdd}
                    >
                        {btnTxtAdd}
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal 
                show={showModalRemove} 
                onHide={() => handleModalRemove(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Remover item
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tem certeza que deseja remover?</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalRemove(false)}>
                        Cancelar
                    </button>
                    <button 
                        className={`button`} 
                        onClick={handleRemove}
                        disabled={btnDisableRemove}
                    >
                        {btnTxtRemove}
                    </button>
                </Modal.Footer>
            </Modal>

            <div>
                <h3 className={`title`}>
                    Itens
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar item
                </button>
                <InputGroup className={`mt-2 mt-md-0`}>
                    <Form.Control 
                        type="text"
                        placeholder="Pesquise aqui..."
                        value={search}
                        onChange={handleChange}
                    />
                    <button className={`button`}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </InputGroup>
            </div>

            <div className={`mt-3`}>
                {items?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Preço</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.title}
                                    </td>
                                    <td>
                                        {Utils.currencyValue(model.price)}
                                    </td>
                                    <td align='right'>
                                        <button 
                                            className={`button`}
                                            onClick={() => handleModalAddUpd(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faSyncAlt} 
                                                className={`${styles.table_icon}`}
                                                title='Atualizar' 
                                            />
                                        </button>
                                        <button 
                                            className={`button ms-2`} 
                                            onClick={() => handleModalRemove(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faTrash} 
                                                className={`${styles.table_icon}`}
                                                title='Apagar'
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                : <div><p>Nenhum item adicionado.</p></div>}
            </div>
        </div>
    )
}

export default ItemComponent;