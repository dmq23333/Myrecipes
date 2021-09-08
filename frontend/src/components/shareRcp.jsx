import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import ShareIcon from '@material-ui/icons/Share';
import GetAppIcon from '@material-ui/icons/GetApp';
import html2canvas from 'html2canvas';

function getModalStyle() {
  const top = 50 ;
  const left = 50 ;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    border: '0px'
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 650,
    height: 650,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
  },
  img: {
    width: '100%',
  }
}));

// this is share recipe button for sharing
export default function ShareRcp() {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const [rcpImg, setImg] = React.useState(new Image());

  // convert the html to canvas and display it on the screen
  const handleOpen = () => {
    setOpen(true);
    html2canvas(document.body).then((canvas) => {
      const newImg = new Image();
      newImg.src = canvas.toDataURL('image/png');
      setImg(newImg);
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  // let user able to download the image of recipe
  const handleShare = () => {
    const aDom = document.createElement("a");
    aDom.href = rcpImg.src;
    aDom.download = "shareRcp.jpg";
    aDom.click();
  }

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Save Image and Share the Recipe</h2>
      <img id="simple-modal-description" src={rcpImg.src} className={classes.img}/>
      <Button variant="contained" color="primary" className={classes.button} onClick={handleShare}>
        Save Recipe
        <GetAppIcon className={classes.rightIcon}>download</GetAppIcon>
      </Button>
    </div>
  );

  return (
    <div data-html2canvas-ignore="true">
      <Button variant="contained" color="primary" className={classes.button} onClick={handleOpen}>
        Share
        <ShareIcon className={classes.rightIcon}>share</ShareIcon>
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}