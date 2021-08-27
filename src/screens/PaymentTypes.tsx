import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import Alert from "../components/Alert";
import { Props } from "../configs/Props";
import { Utils } from "../configs/Utils";
import { Validations } from "../configs/Validations";
import { PaymentType } from "../models/PaymentType";
import Api, { PAYMENT_TYPE_URL } from "../services/api";

import styles from '../styles/paymentType.module.css';

const PaymentTypes = (props: Props) => {

    const [search, setSearch] = useState("");
    const [paymentTypes, setPaymentTypes] = useState([] as PaymentType[]);
    const [paymentTypeUpd, setPaymentTypeUpd] = useState({} as PaymentType);
    const [initPaymentTypes, setInitPaymentTypes] = useState([] as PaymentType[]);
    
    const [name, setCode] = useState("");
    const [nameError, setCodeError] = useState("");

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
        
        const getPaymentTypes = async () => {

            await api.get(PAYMENT_TYPE_URL).then(res => {
                setPaymentTypes(res);
                setInitPaymentTypes(res);
            });
        }
        getPaymentTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initPaymentTypes?.filter(cp =>
            cp.name.toLowerCase().includes(search.toLowerCase())
        );
        setPaymentTypes(results);
    }, [initPaymentTypes, search]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var cError = Validations.validateRequiredField(name, "nome");

        if(cError)
        {
            setCodeError(cError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new PaymentType();
                model.name = name;
                
                await api.insert(PAYMENT_TYPE_URL, model)
                .then(res => {
                    const cpn = res.data.data as PaymentType;
                    Utils.alertLocalStorage('Meio de pagamento inserido com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    setPaymentTypes([...paymentTypes, cpn]);
                    setInitPaymentTypes([...initPaymentTypes, cpn]);
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
                paymentTypeUpd.name = name;
                
                
                await api.update(PAYMENT_TYPE_URL, paymentTypeUpd)
                .then(res => {
                    const cpn = res.data.data as PaymentType;
                    Utils.alertLocalStorage('Meio de pagamento atualizado com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initPaymentTypes.filter((x) => x.id !== cpn.id);
                    setPaymentTypes([...newCpn, cpn]);
                    setInitPaymentTypes([...newCpn, cpn]);
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
            await api.delete(PAYMENT_TYPE_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Meio de pagamento removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initPaymentTypes.filter((x) => x.id !== idRemove);
                setPaymentTypes(newCpn);
                setInitPaymentTypes(newCpn);
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

        if(id !== '')
        {
            setBtnTxtAdd('Atualizar');
            await api.getById(PAYMENT_TYPE_URL, id)
            .then(res => {
                const cpn = res as PaymentType;
                setPaymentTypeUpd(cpn);
                setCode(cpn.name);
                setIdUpdate(id !== '' ? id : idUpdate);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados do meio de pagamento', false);
                setShowModalAdd(false);
            });
        }
        else
        {
            setBtnTxtAdd('Adicionar');
            setIdUpdate('');
            setCode('');
        }
        setShowModalAdd(isOpen);
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

            <Alert state={props.location.state} />

            <Modal 
                show={showModalAdd} 
                onHide={() => handleModalAddUpd(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Adicionar meio de pagamento
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>
                    <Form.Group controlId="formPassword" className={`d-flex flex-column align-items-start`}>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o nome" 
                            value={name}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {nameError}
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
                        Remover meio de pagamento
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
                    Meios de pagamento
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar meio de pagamento
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
                {paymentTypes?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paymentTypes.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.name}
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
                : <div><p>Nenhum meio de pagamento adicionado.</p></div>}
            </div>
        </div>
    )
}

export default PaymentTypes;