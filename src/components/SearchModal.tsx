import "./SearchModal.css"
interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export const SearchModal = (props: SearchModalProps) => {
    if (!props.isOpen) return null; 
    return (
        <>
        <div className="modal-overlay" onClick={props.onClose} aria-hidden="true" />
        <div className="modal" role="dialog" aria-modal="true" aria-label="GitHub User Search">
            <h1>Hello world</h1>
        </div>
        </>
    );
}