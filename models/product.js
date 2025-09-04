module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.FLOAT,
    createdBy: DataTypes.UUID,
    updatedBy: DataTypes.UUID,
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true        
  })
  return product
}
