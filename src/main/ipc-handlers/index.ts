import registerFolderHandlers from './folder-handlers';
import registerImageHandlers from './image-handlers';

export const registerHandlers = () => {
  registerFolderHandlers();
  registerImageHandlers();
};

export default registerHandlers;