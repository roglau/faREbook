import { useState, useEffect } from 'react';
import { encryptStorage } from '../pages/auth/login';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_INVITE, GET_ALL_NOTIF, GET_USER_W_TOKEN } from '../query/query';

export const getUser = () => {
    const [token, setToken] = useState<any>("");
    const [data, setData] = useState<any>("");

    useEffect(() => {
        if (encryptStorage.getItem("jwtToken"))
            setToken(encryptStorage.getItem("jwtToken"))
    }, [])

    const [getUserWToken] = useMutation(GET_USER_W_TOKEN)

    useEffect(() => {
        const fetchData = async () => {
            if (token) {
                try {
                    const response = await getUserWToken({
                        variables: {
                            token: token
                        }
                    });
                    await setData(response.data);
                    return data;
                } catch (err) {
                    console.log(err);
                }
            }
        };
        if(token)
        fetchData();
    }, [token]);

    return data !== null ? data : null;
};

type NotifData = {
    notifs: any;
    refetchNotif: any;
  };
  


export const getNotif = (data: any) : NotifData | null => {

    const {data: notifs, refetch} = useQuery(GET_ALL_NOTIF, {
        variables : {
            userID : data?.getUserWToken?.id
        }
    })

    
    
    useEffect(() => {
        // console.log(notifs)
    }, [notifs]);

    if(!data) return null;


    return {notifs: notifs?.getAllNotif, refetchNotif: refetch};

};

export const getInvite = (data: any) : any => {

    const {data : invites, refetch: refetchInv}  = useQuery(GET_ALL_INVITE, {
        variables : {
            userID: data?.getUserWToken?.id
        }
    })

    if(!data) return null;


    return {invites, refetchInv};

};