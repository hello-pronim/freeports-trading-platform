import { Avatar, Grid, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
import { FieldRenderProps, FormRenderProps } from "react-final-form";

const useStyles = makeStyles((theme) => ({
  profileImageContainer: {
    position: "relative",
    width: 200,
    height: 200,
    margin: "auto",
    "&:hover, &:focus": {
      "& $profileImage": {
        opacity: 0.5,
      },
    },
  },
  profileImage: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  profileFileInput: {
    opacity: 0,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    cursor: "pointer",
  },
}));

const AvatarInput: React.FC<FieldRenderProps<any, HTMLElement>> = ({
  input: { value, onChange },
}: FieldRenderProps<any, HTMLElement>) => {
  const classes = useStyles();
  const [managerAvatar, setManagerAvatar] = useState(value);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setManagerAvatar(event.target.result);
        onChange(event.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  return (
    <Grid item xs={5}>
      <div className={classes.profileImageContainer}>
        <Avatar
          src={managerAvatar}
          alt="Avatar"
          className={classes.profileImage}
        />
        <input
          type="file"
          className={classes.profileFileInput}
          onChange={onAvatarChange}
        />
      </div>
    </Grid>
  );
};
export default AvatarInput;
