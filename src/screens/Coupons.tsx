import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import Alert from "../components/Alert";
import { Props } from "../configs/Props";
import { Utils } from "../configs/Utils";
import { Validations } from "../configs/Validations";
import { Coupon } from "../models/Coupon";
import Api, { COUPON_URL } from "../services/api";

import styles from '../styles/coupon.module.css';

const Coupons = (props: Props) => {

    const [search, setSearch] = useState("");
    const [coupons, setCoupons] = useState([] as Coupon[]);
    const [couponUpd, setCouponUpd] = useState({} as Coupon);
    const [initCoupons, setInitCoupons] = useState([] as Coupon[]);
    
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");

    const [idUpdate, setIdUpdate] = useState("");
    const [idRemove, setIdRemove] = useState("");

    const [isActive, setIsActive] = useState(true);
    
    const [btnDisableAdd, setBtnDisableAdd] = useState(false);
    const [btnTxtAdd, setBtnTxtAdd] = useState<string | object>("Adicionar");
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    const [btnDisableRemove, setBtnDisableRemove] = useState(false);
    const [btnTxtRemove, setBtnTxtRemove] = useState<string | object>("Remover");
    const [showModalRemove, setShowModalRemove] = useState(false);

    const api = new Api();

    useEffect(() => {
        
        const getCoupons = async () => {

            await api.get(COUPON_URL).then(res => {
                setCoupons(res);
                setInitCoupons(res);
            });
        }
        getCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initCoupons?.filter(cp =>
            cp.code.toLowerCase().includes(search.toLowerCase())
        );
        setCoupons(results);
    }, [initCoupons, search]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var cError = Validations.validateRequiredField(code, "código");

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
                var model = new Coupon();
                model.code = code;
                model.isActive = isActive;
                
                await api.insert(COUPON_URL, model)
                .then(res => {
                    const cpn = res.data.data as Coupon;
                    Utils.alertLocalStorage('Cupom inserido com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    setCoupons([...coupons, cpn]);
                    setInitCoupons([...initCoupons, cpn]);
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
                couponUpd.code = code;
                couponUpd.isActive = isActive;
                
                await api.update(COUPON_URL, couponUpd)
                .then(res => {
                    const cpn = res.data.data as Coupon;
                    Utils.alertLocalStorage('Cupom atualizado com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initCoupons.filter((x) => x.id !== cpn.id);
                    setCoupons([...newCpn, cpn]);
                    setInitCoupons([...newCpn, cpn]);
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
            await api.delete(COUPON_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Cupom removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initCoupons.filter((x) => x.id !== idRemove);
                setCoupons(newCpn);
                setInitCoupons(newCpn);
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
            await api.getById(COUPON_URL, id)
            .then(res => {
                const cpn = res as Coupon;
                setCouponUpd(cpn);
                setCode(cpn.code);
                setIsActive(cpn.isActive);
                setIdUpdate(id !== '' ? id : idUpdate);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados do cupom', false);
                setShowModalAdd(false);
            });
        }
        else
        {
            setBtnTxtAdd('Adicionar');
            setIdUpdate('');
            setCode('');
            setIsActive(true);
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
                        Adicionar cupom
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>
                    <Form.Group controlId="formPassword" className={`d-flex flex-column align-items-start`}>
                        <Form.Label>Código</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o código" 
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                        />
                        <Form.Text className="text-danger">
                            {codeError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formCheckbox" className={`d-flex align-items-start`}>
                        <Form.Check 
                            type="checkbox" 
                            label="Ativo"
                            checked={isActive} 
                            onChange={() => setIsActive(!isActive)} 
                        />
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
                        Remover cupom
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
                    Cupons
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar cupom
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
                {coupons?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Ativo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.code}
                                    </td>
                                    <td>
                                        <Form.Check 
                                            type="checkbox"
                                            checked={model.isActive} 
                                        />
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
                : <div><p>Nenhum cupom adicionado.</p></div>}
            </div>
        </div>
    )
}

export default Coupons;