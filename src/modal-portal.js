import React from 'react';
import Modal from 'react-modal';
import './Popup.css';


const Popup = (props) => {
  const { showModal, handleClose, modalBody, modalTitle } = props;

  return (
    <div>
      <Modal isOpen={showModal} ariaHideApp={false} className="content" overlayClassName="overlay">
        <div className="modal-title">{modalTitle}</div>
        <hr />
        <div className="modal-content">
          {modalBody}
        </div>
        <div className="modal-footer">
          <button className="small secondary" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Popup;
