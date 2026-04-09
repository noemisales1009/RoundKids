import { useContext, useEffect } from 'react';
import { HeaderContext } from '../contexts';

export const useHeader = (title: string) => {
    const context = useContext(HeaderContext);
    useEffect(() => {
        if (context) {
            context.setTitle(title);
        }
    }, [title, context]);
};
