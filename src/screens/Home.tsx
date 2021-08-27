import { faClipboardList, faCreditCard, faHamburger, faStoreAlt, faTicketAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { Card } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Alert from "../components/Alert";
import { Props } from "../configs/Props";
import { Session } from "../services/session";

import styles from '../styles/home.module.css';

const Home = (props: Props) => {

    const history = useHistory();

    useEffect(() => {
        
        if(!Session.isAuthenticated())
        {
            history.push('/login');
        }
    }, []);

    const handleCardMenu = (url: string) => history.push(url);

    return (
        <div className={`${styles.div_home}`}>

            <Alert state={props.location.state} />

            <div className={`text-center`}>
                <h1 className={`${styles.h_home}`}>
                    PAINEL ADMIN
                </h1>
            </div>

            <div className={`row ${styles.div_row_menu}`}>
                <div className={`col-md-4 d-flex justify-content-center`}>
                    <Card className={`${styles.card_menu}`} onClick={() => handleCardMenu('/pedidos')}>
                        <Card.Body className={`${styles.card_body_menu}`}>
                            <FontAwesomeIcon icon={faClipboardList} className={`${styles.icon_menu}`} />

                            <h6 className={`mt-3`}>
                                Pedidos
                            </h6>
                        </Card.Body>
                    </Card>
                </div>
                <div className={`col-md-4 mt-md-0 mt-3 d-flex justify-content-center`}>
                    <Card className={`${styles.card_menu}`} onClick={() => handleCardMenu('/usuarios')}>
                        <Card.Body className={`${styles.card_body_menu}`}>
                            <FontAwesomeIcon icon={faUsers} className={`${styles.icon_menu}`} />
                            <h6 className={`mt-3`}>
                                Usuários
                            </h6>
                        </Card.Body>
                    </Card>
                </div>
                <div className={`col-md-4 mt-md-0 mt-3 d-flex justify-content-center`}>
                    <Card className={`${styles.card_menu}`} onClick={() => handleCardMenu('/produtos')}>
                        <Card.Body className={`${styles.card_body_menu}`}>
                            <FontAwesomeIcon icon={faHamburger} className={`${styles.icon_menu}`} />
                            <h6 className={`mt-3`}>
                                Produtos
                            </h6>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <div className={`row ${styles.div_row_menu} mt-3`}>
                <div className={`col-md-4 d-flex justify-content-center`}>
                    <Card className={`${styles.card_menu}`} onClick={() => handleCardMenu('/lojas')}>
                        <Card.Body className={`${styles.card_body_menu}`}>
                            <FontAwesomeIcon icon={faStoreAlt} className={`${styles.icon_menu}`} />

                            <h6 className={`mt-3`}>
                                Lojas
                            </h6>
                        </Card.Body>
                    </Card>
                </div>
                <div className={`col-md-4 mt-md-0 mt-3 d-flex justify-content-center`}>
                    <Card className={`${styles.card_menu}`} onClick={() => handleCardMenu('/pagamento')}>
                        <Card.Body className={`${styles.card_body_menu}`}>
                            <FontAwesomeIcon icon={faCreditCard} className={`${styles.icon_menu}`} />
                            <h6 className={`mt-3`}>
                                Meios de pagamento
                            </h6>
                        </Card.Body>
                    </Card>
                </div>
                <div className={`col-md-4 mt-md-0 mt-3 d-flex justify-content-center`}>
                    <Card className={`${styles.card_menu}`} onClick={() => handleCardMenu('/cupons')}>
                        <Card.Body className={`${styles.card_body_menu}`}>
                            <FontAwesomeIcon icon={faTicketAlt} className={`${styles.icon_menu}`} />
                            <h6 className={`mt-3`}>
                                Cupons
                            </h6>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Home;