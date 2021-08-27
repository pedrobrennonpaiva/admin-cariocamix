import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "../Alert";
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { Category } from "../../models/Category";
import Api, { CATEGORY_URL } from "../../services/api";

import styles from '../../styles/default.module.css';

const CategoryComponent = () => {

    const [search, setSearch] = useState("");
    const [categorys, setCategorys] = useState([] as Category[]);
    const [categoryUpd, setCategoryUpd] = useState({} as Category);
    const [initCategorys, setInitCategorys] = useState([] as Category[]);
    
    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState("");

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
        
        const getCategorys = async () => {

            await api.get(CATEGORY_URL).then(res => {
                setCategorys(res);
                setInitCategorys(res);
            });
        }
        getCategorys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initCategorys?.filter(cp =>
            cp.title.toLowerCase().includes(search.toLowerCase())
        );
        setCategorys(results);
    }, [initCategorys, search]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var cError = Validations.validateRequiredField(title, "nome");

        if(cError)
        {
            setTitleError(cError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new Category();
                model.title = title;
                
                await api.insert(CATEGORY_URL, model)
                .then(res => {
                    const cpn = res.data.data as Category;
                    Utils.alertLocalStorage('Categoria inserida com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    setCategorys([...categorys, cpn]);
                    setInitCategorys([...initCategorys, cpn]);
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
                categoryUpd.title = title;
                
                
                await api.update(CATEGORY_URL, categoryUpd)
                .then(res => {
                    const cpn = res.data.data as Category;
                    Utils.alertLocalStorage('Categoria atualizada com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initCategorys.filter((x) => x.id !== cpn.id);
                    setCategorys([...newCpn, cpn]);
                    setInitCategorys([...newCpn, cpn]);
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
            await api.delete(CATEGORY_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Categoria removida com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initCategorys.filter((x) => x.id !== idRemove);
                setCategorys(newCpn);
                setInitCategorys(newCpn);
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
            setShowModalAdd(isOpen);
        }
        else
        {
            if(id !== '')
            {
                setBtnTxtAdd('Atualizar');
                await api.getById(CATEGORY_URL, id)
                .then(res => {
                    const cpn = res as Category;
                    setCategoryUpd(cpn);
                    setTitle(cpn.title);
                    setIdUpdate(id !== '' ? id : idUpdate);
                })
                .catch(err => {
                    console.log(err);
                    Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados da categoria', false);
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
                        Adicionar categoria
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
                        Remover categoria
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
                    Categorias
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar categoria
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
                {categorys?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorys.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.title}
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
                : <div><p>Nenhuma categoria adicionada.</p></div>}
            </div>
        </div>
    )
}

export default CategoryComponent;