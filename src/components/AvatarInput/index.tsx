import React, { useEffect, useState } from "react";
import { Avatar, makeStyles } from "@material-ui/core";
import { FieldRenderProps, FormRenderProps } from "react-final-form";

import profile from "../../assets/images/profile.jpg";

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
  const [avatar, setAvatar] = useState(profile);

  useEffect(() => {
    let unmounted = false;

    if (!unmounted) {
      if (value !== "") setAvatar(value);
      else setAvatar(profile);
    }

    return () => {
      unmounted = true;
    };
  }, [value]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.currentTarget;
    if (files && files.length) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setAvatar(event.target.result);
        onChange(event.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  return (
    <div className={classes.profileImageContainer}>
      {avatar !== "" && (
        <Avatar src={avatar} alt="Avatar" className={classes.profileImage} />
      )}
      {avatar === "" && (
        <Avatar src={profile} alt="Avatar" className={classes.profileImage} />
      )}
      <input
        type="file"
        className={classes.profileFileInput}
        onChange={onAvatarChange}
      />
    </div>
  );
};
export default AvatarInput;
